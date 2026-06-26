# Environment Routing

## 1. Introduction and Goals

### 1.1 Requirements Overview

The CED portal serves two populations of users from a single deployment:

| User type                     | `userType` values             | Backend target                                    |
| ----------------------------- | ----------------------------- | ------------------------------------------------- |
| Production operators / admins | `operator`, `admin`           | Production PostgreSQL database, Production AR API |
| Test operators / admins       | `test_operator`, `test_admin` | Test PostgreSQL database, Test AR API             |

The routing decision must be:

- **Per-request** — two concurrent requests from different user types must be independently isolated.
- **Transparent to domain code** — repositories and use-cases must not know that two environments exist.
- **Composition-root owned** — the app wires the routing; packages remain generic.

### 1.2 Quality Goals

| Priority | Quality goal           | Scenario                                                                 |
| -------- | ---------------------- | ------------------------------------------------------------------------ |
| 1        | **Data isolation**     | A test user's write must never reach the production database.            |
| 2        | **Concurrency safety** | Concurrent prod and test requests must not pollute each other's context. |
| 3        | **Transparency**       | Repositories accept a plain client; they are unaware of routing.         |
| 4        | **Observability**      | Every routing decision is emitted as a custom telemetry event.           |

---

## 2. Architecture Constraints

- Node.js single-threaded event loop — concurrency is cooperative (async/await), not preemptive threads.
- `AsyncLocalStorage` (Node.js built-in) propagates context through async call chains without explicit passing.
- The monorepo follows hexagonal architecture: domain and application layers must not import infrastructure adapters.
- All packages are ESM-only (`"type": "module"`).

---

## 3. System Scope and Context

```
┌─────────────────────────────────────────────────────┐
│                  ced-portal-be                       │
│                                                      │
│  Fastify request ──► authPreHandler                  │
│                          │                           │
│                          ▼                           │
│               sessionContextPreHandler               │
│               (populates AsyncLocalStorage)          │
│                          │                           │
│                          ▼                           │
│             Route handler ──► Use case               │
│                                    │                 │
│                                    ▼                 │
│                             Repository               │
│                          (plain db / arClient)       │
│                                    │                 │
│                          ┌─────────┴──────────┐      │
│                          │   EnvRouter Proxy  │      │
│                          │  reads ALS on each │      │
│                          │  property access   │      │
│                          └──────┬──────┬──────┘      │
│                              prod  │  test           │
└──────────────────────────────────┼────┼─────────────┘
                                   │    │
                            Prod DB│    │Test DB
                            Prod AR│    │Test AR
```

---

## 4. Solution Strategy

The core insight is that **`getInstance()` does not need to return a different object per request**. Instead, it returns a single stable `Proxy` whose property-access trap re-evaluates the routing predicate (`isTestRequest`) on every access. Because `isTestRequest` reads from `AsyncLocalStorage` — which Node.js propagates correctly through async call chains — every property access automatically resolves to the correct backing instance for the currently-executing request.

This lets composition-root code capture `getInstance()` **once at startup** and pass the result to repositories as if it were a plain client:

```ts
// main.ts — called once at startup
const db = dbRouter.getInstance(); // returns a Proxy
const arClient = arClientRouter.getInstance(); // returns a Proxy

// repositories receive plain-typed clients — they know nothing about routing
const operatorRepository = createDrizzleOperatorRepository(db);
const arOnboardingRepository = createArOnboardingRepository(arClient);
```

---

## 5. Building Block View

### 5.1 `@pagopa/io-core-environment-router`

A zero-dependency package that wraps any two singletons behind a `Proxy`.

```
packages/io-core-environment-router/
└── src/
    ├── env-router.ts          # createEnvRouter, EnvRouter, EnvRouterParams, EnvRouterEnv
    ├── index.ts               # public re-exports
    └── __tests__/
        └── env-router.test.ts
```

**Public API:**

```ts
interface EnvRouterParams<TConfig, TInstance extends object> {
  prodConfig: TConfig;
  testConfig: TConfig;
  createProdInstance: (config: TConfig) => TInstance;
  createTestInstance: (config: TConfig) => TInstance;
  isTestRequest: () => boolean; // lazy, re-evaluated on every access
  onRoute?: (env: "prod" | "test") => void; // optional telemetry hook
}

interface EnvRouter<TInstance extends object> {
  getInstance: () => TInstance; // always the same Proxy reference
  instances: readonly TInstance[]; // [prod, test] — for lifecycle/shutdown
}
```

The package is completely generic. It has no knowledge of Fastify, Drizzle, AsyncLocalStorage, or any specific client type. All of those concerns are injected by the consuming app.

### 5.2 `async-local-storage-session-context.ts` (ced-portal-be)

Owns the single `AsyncLocalStorage<Session>` instance for the whole app.

- `getRequestSession()` — reads the current request's session (or `undefined` outside a request context).
- `createSessionContextPreHandler(getSession)` — Fastify preHandler factory that calls `storage.run(session, done)`, binding the session to the current async context tree.

### 5.3 Composition root (`main.ts`)

Builds both routers, calls `getInstance()` once for each, and threads the proxies into the repository factories:

```ts
const isTestRequest = (): boolean => {
  const userType = getRequestSession()?.userType;
  return userType === "test_admin" || userType === "test_operator";
};

const dbRouter = createEnvRouter({ ..., isTestRequest });
const arClientRouter = createEnvRouter({ ..., isTestRequest });

const db = dbRouter.getInstance();       // stable Proxy
const arClient = arClientRouter.getInstance(); // stable Proxy
```

---

## 6. Runtime View

### 6.1 Authenticated request (test operator)

```
1. Request arrives
2. authPreHandler        — validates session token, confirms user exists
3. sessionContextPreHandler — calls storage.run(session, done)
                              ALS now holds { userType: "test_operator", ... }
4. Route handler → Use case → Repository
5. db.transaction(...)   — proxy.get("transaction") fires
   isTestRequest()       — reads ALS → "test_operator" → returns true
   active = testInstance — testDb.transaction() is called
   onRoute("test")       — emits "env-router.db.routed" custom event
```

### 6.2 Concurrent prod and test requests

```
Time │  Request A (prod operator)          Request B (test operator)
─────┼──────────────────────────────────────────────────────────────
 t1  │  ALS: { userType: "operator" }
 t2  │                                     ALS: { userType: "test_operator" }
 t3  │  db.execute → proxy.get("execute")
     │  isTestRequest() → ALS A → false → prodInstance
 t4  │                                     db.execute → proxy.get("execute")
     │                                     isTestRequest() → ALS B → true → testInstance
 t5  │  db.execute → proxy.get("execute")
     │  isTestRequest() → ALS A → false → prodInstance  ✓ (not polluted)
```

There is **no shared mutable state** in the router. `isTestRequest()` reads only from ALS, which Node.js propagates per async context tree. Each request runs in its own `AsyncLocalStorage` context established by `storage.run()` in the preHandler.

### 6.3 Public routes (no session)

Public routes (`/api/info/startup`, `/api/info/readiness`, `/api/authorize`, `/api/acs`) are registered on the root Fastify app, **outside** the plugin scope that registers the auth and ALS preHandlers. They therefore never execute `storage.run()`.

When a public route causes a proxy property access:

```
proxy.get("execute")
  isTestRequest()
    getRequestSession()  →  undefined  (no ALS context)
  returns false          →  routes to prodInstance
```

The prod instance is the correct default for unauthenticated infrastructure calls (e.g., the readiness health check queries the prod database). This is safe because public routes never touch user data.

---

## 7. Design Decisions

### ADR-1: Proxy over factory function

**Context:** Once `getInstance()` is called at startup and its result captured in a closure, a simple function returning the current instance would always return the startup-time value (ALS is empty at startup → always prod).

**Decision:** Use `Proxy` + `Reflect.get` so the routing predicate is re-evaluated on every **property access**, not at capture time.

**Consequence:** Repositories capture the proxy once and use it as a plain client. Routing is transparent. The caller does not need to call `getInstance()` inside every method.

`Reflect.get(active, property, active)` is used instead of `active[property]` to correctly pass `active` as the receiver (`this`) for property getters that use `this`.

**Rejected alternative:** Inject a getter function `() => TypedDbClient` into every repository. This would work but leaks the routing abstraction into every repository signature and requires disciplined per-method invocation.

---

## 8. Cross-cutting Concerns

### Observability

Every routing decision can emit a custom event by injecting an `emitCustomEvent`  through `onRoute`. Events do not carry any user PII — only the environment name (`"prod"` or `"test"`).

```ts
onRoute: (env) =>
  emitCustomEvent("env-router.db.routed", {
    caller: "DbRouter",
    data: { env },
  })("DbRouter"),
```

### Lifecycle management

We can use `instances` to manage instances created by the router.

For example `dbRouter.instances` exposes `[prodInstance, testInstance]`. The `onClose` hook iterates both to close all connections regardless of which environment was active:

```ts
app.addHook("onClose", async () => {
  await Promise.all(dbRouter.instances.map((db) => db.closeConnection()));
});
```

---

## 9. Risks and Technical Debt

| Risk                                                                                                           | Likelihood | Impact | Mitigation                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALS not propagated through a third-party library's internal callbacks                                          | Low        | High   | ALS propagation is part of the Node.js async context spec; any well-behaved library using `async/await` or `Promise` will propagate it correctly. |
| Readiness check only validates the prod database                                                               | Accepted   | Low    | Health probes check service availability, not all managed environments. A separate monitoring alert on the test DB is recommended.                |
| `Proxy` `get` trap fires for every property access including non-user-facing ones (e.g., `Symbol.toPrimitive`) | Accepted   | Low    | `isTestRequest()` is a pure synchronous ALS read — negligible overhead.                                                                           |

# AsyncLocalStorage — Session Context

## 1. Introduction and Goals

### 1.1 Problem Statement

A Fastify application handles many concurrent requests within a single Node.js process. Certain cross-cutting concerns — environment routing, audit logging, telemetry — need to read data that belongs to the current request (e.g., the authenticated user's session) without passing that data explicitly through every function call from the HTTP handler down to a repository.

The naive alternatives all fail:

| Alternative                       | Problem                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Thread-local storage              | Node.js is single-threaded; no native thread-locals                                         |
| Module-level singleton            | Shared across all concurrent requests → race conditions                                     |
| Pass session as function argument | Pollutes every function signature in every layer                                            |
| Attach data to `FastifyRequest`   | Requires Fastify context to reach repository / use-case code, breaking hexagonal boundaries |

### 1.2 Goals

- Provide a way to read the current request's `Session` from any point in the call stack without explicitly passing it down.
- Keep domain and application layers unaware of Fastify and HTTP context.
- Guarantee per-request isolation: concurrent requests must never observe each other's session data.

---

## 2. Architecture Constraints

- Node.js 22, single-threaded event loop — "concurrency" is async interleaving, not parallel threads.
- ESM-only (`"type": "module"`). The ALS module is a Node.js built-in (`node:async_hooks`), requiring no external dependency.
- Hexagonal architecture: the domain and application layers must not import Fastify types or HTTP primitives.

---

## 3. What is AsyncLocalStorage?

`AsyncLocalStorage` (part of Node.js `async_hooks`) creates a **context that is automatically propagated through all `async/await` chains, `Promise` callbacks, and timer callbacks** that originate from within a `storage.run()` call.

```
storage.run(value, callback)
  └─► callback()        ← can read storage.getStore() → value
        └─► await asyncFn()   ← still reads same value
              └─► someCallback()   ← still reads same value
```

Crucially, each `storage.run()` call creates an **independent context**. Two concurrent requests each calling `storage.run()` see completely separate stores — they cannot read each other's values, even though they share the same `AsyncLocalStorage` instance and the same OS thread.

This is implemented by Node.js internally using `AsyncResource` and execution context tracking. Each async operation inherits the context of its parent, and `storage.run()` creates a new child context that shadows the parent's store.

---

## 4. Implementation

### 4.1 Module: `async-local-storage-session-context.ts`

```ts
import { AsyncLocalStorage } from "node:async_hooks";
import type { Session } from "./domain/entities/session.js";

const storage = new AsyncLocalStorage<Session>();

export const getRequestSession = (): Session | undefined => storage.getStore();

export const createSessionContextPreHandler =
  (
    getSession: (
      request: FastifyRequest,
    ) => Promise<Result<Session, BaseError>>,
  ) =>
  (
    request: FastifyRequest,
    _reply: FastifyReply,
    done: (err?: Error) => void,
  ): void => {
    getSession(request)
      .then((result) => {
        if (result.isOk()) {
          storage.run(result.value, done);
        } else {
          done(result.error);
        }
      })
      .catch((e: unknown) =>
        done(e instanceof Error ? e : new Error(String(e))),
      );
  };
```

Two elements are exported:

| Export                                       | Purpose                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `getRequestSession()`                        | Read the current request's session anywhere in the call stack. Returns `undefined` when called outside a request context. |
| `createSessionContextPreHandler(getSession)` | Fastify preHandler factory that binds the session to ALS for the duration of the request.                                 |

### 4.2 How `storage.run()` works

`storage.run(session, done)` does two things:

1. Creates a new child async context whose store is `session`.
2. Calls `done()` **inside** that context.

Because Fastify's preHandler `done()` callback is the mechanism that triggers the next step in the request lifecycle (the route handler, and everything it `await`s), the entire downstream async call tree executes inside the ALS context. Every `await`, every `.then()`, every callback, automatically inherits the same store.

### 4.3 Registration in `main.ts`

```ts
app.register(async (app) => {
  // 1. Validates the session token and rejects unauthenticated requests.
  app.addHook("preHandler", authPreHandler);

  // 2. Resolves the full Session object and binds it to ALS.
  app.addHook(
    "preHandler",
    createSessionContextPreHandler((req) =>
      getSessionFromRequest(req, SessionSchema),
    ),
  );

  // All authenticated routes are mounted here.
  // ...
});
```

Both hooks are registered inside `app.register(async (app) => { ... })`, which creates a Fastify plugin scope. Hooks registered in a child scope only apply to routes registered in **that same scope**. Public routes (`/info/startup`, `/info/readiness`, `/authorize`, `/acs`) are registered on the parent `app` and are never touched by these hooks.

---

## 5. Per-request Isolation and Concurrency Safety

### 5.1 The invariant

Each call to `storage.run(value, fn)` creates an independent execution context. `storage.getStore()` always returns the value from the **nearest enclosing `storage.run()`** in the current async call chain — never from a different call chain running concurrently in the same process.

### 5.2 Concrete example: two concurrent requests

```
Event loop tick sequence (simplified):

  tick 1:  Request A preHandler starts → storage.run(sessionA, doneA)
  tick 2:  Request B preHandler starts → storage.run(sessionB, doneB)
  tick 3:  Request A route handler → getRequestSession() → sessionA ✓
  tick 4:  Request B route handler → getRequestSession() → sessionB ✓
  tick 5:  Request A repository → getRequestSession() → sessionA ✓
  tick 6:  Request B repository → getRequestSession() → sessionB ✓
```

Even though both requests share the same `storage` object and the same event loop, `getStore()` always resolves to the value provided by the nearest `storage.run()` that is an ancestor of the current async chain. Node.js tracks this through `AsyncResource` context IDs assigned at each `await` point.

### 5.3 No shared mutable state

The `storage` module-level variable is a reference to a single `AsyncLocalStorage` instance. **It does not hold any session data itself.** Session data lives in the per-async-context slots that Node.js manages internally. There is nothing to lock, no shared variable to mutate, and no mechanism by which one request can overwrite another's slot.

---

## 6. Interaction with the Environment Router

The primary consumer of `getRequestSession()` is the routing predicate injected into `createEnvRouter`:

```ts
const isTestRequest = (): boolean => {
  const userType = getRequestSession()?.userType;
  return userType === "test_admin" || userType === "test_operator";
};
```

This predicate is called by the `Proxy` trap on every property access of the routed client (database, AR API client). Because the predicate calls `getRequestSession()`, which reads from ALS, it automatically sees the session that belongs to the request currently being executed — no explicit threading, no argument passing.

See [../environment-routing/design-review.md](../environment-routing/design-review.md) for the full router design.

---

## 7. Public Routes and the Absence of a Context

Public routes are registered outside the Fastify plugin scope that runs the ALS preHandler. When code executing on behalf of a public route calls `getRequestSession()`, there is no enclosing `storage.run()`, so `storage.getStore()` returns `undefined`.

All consumers of `getRequestSession()` must handle this:

```ts
// isTestRequest — always false when no context
const userType = getRequestSession()?.userType; // optional chaining handles undefined
return userType === "test_admin" || userType === "test_operator"; // false
```

This is safe and intentional: unauthenticated requests default to the production environment (the correct and conservative choice for health probes and public SAML flows).

---

## 8. Implications and Constraints

### 8.1 All async operations must be native

ALS propagation relies on Node.js's built-in async context tracking. It works correctly with:

- `async/await`
- `Promise.then/catch/finally`
- `setTimeout`, `setImmediate`, `process.nextTick`
- Node.js streams and event emitters (since Node.js 12+)

It **does not** propagate through:

- `EventEmitter` listeners registered **before** the `storage.run()` call (the context was established after the listener was attached)
- Native add-ons that spawn OS threads and call back asynchronously without using `AsyncResource`
- Worker threads (each worker has its own ALS, not inherited from the parent)

The practical implication: never detach a callback from the current async chain when you need session context. Specifically, do not use `process.nextTick` or `setImmediate` to defer work to a tick that starts outside the current async context.

### 8.2 Context is inherited, not shared

Child contexts inherit the store value of their parent context at creation time. If the parent modifies its context (by calling `storage.run()` again), existing children are unaffected. This means that if a request spawns a background job (e.g., via `setImmediate` from within a `storage.run()` scope), the job inherits the session but any subsequent change to the parent context does not affect the job.

In practice, ced-portal-be does not spawn background jobs from request handlers, so this is not a concern.

### 8.3 `getRequestSession()` can return `undefined`

This is a deliberate design choice. Returning `undefined` rather than throwing makes the function safe to call from any context, including code that is shared between public and authenticated paths. All callers use optional chaining or explicit `undefined` checks.

### 8.4 The `storage` instance is a module singleton

`AsyncLocalStorage<Session>` is instantiated once at module load time. There is exactly one instance for the entire process lifetime. This is correct: the instance itself is stateless; its only purpose is to provide a namespace for the per-context slots. Using multiple instances would only be needed if you wanted multiple independent ALS namespaces simultaneously (e.g., separate stores for session context and for distributed trace context).

### 8.5 Memory

Each `storage.run()` call allocates a small context slot that is garbage-collected when the async subtree it created has finished (i.e., when the request completes and all `Promise` chains have settled). There is no manual cleanup required. Fastify's request lifecycle ensures that every `done()` callback is eventually called, bounding the lifetime of each slot.

---

## 9. Design Decisions

### ADR-1: Module-level singleton rather than dependency-injected instance

**Context:** `getRequestSession()` must be callable from deep inside the call stack — including from `isTestRequest()`, which is a plain function passed to `createEnvRouter` at startup.

**Decision:** Export `getRequestSession` directly from a module that owns the `AsyncLocalStorage` instance. Any code that imports this function can read the current request session without needing a reference to the storage object itself.

**Consequence:** The module creates an implicit dependency. This is acceptable because ALS is not something that benefits from being swappable in production. Tests mock the behaviour of `getRequestSession` directly (or indirectly by controlling the session returned by `getSessionFromRequest`).

**Rejected alternative:** Pass the `AsyncLocalStorage` instance as a constructor/factory argument throughout the call stack. This would require threading it through `createEnvRouter`, every repository factory, and every use case — purely mechanical plumbing with no design benefit.

### ADR-2: `done`-callback style (not `async/await`) for the preHandler

**Context:** Fastify preHandlers support both the `async` style and the callback `done` style.

**Decision:** Use the `done`-callback style. This is necessary because `storage.run(value, fn)` calls `fn` synchronously inside the new context. An `async` preHandler would `await` before calling `done`, which might create a context switch where the `storage.run()` has already returned, potentially losing the context in some edge cases.

**Consequence:** The preHandler implementation uses `.then()` / `.catch()` manually rather than `async/await`. This is a minor ergonomic cost for correctness.

### ADR-3: ALS context not propagated to Worker Threads

**Decision:** Worker Threads are not used in ced-portal-be. If they were introduced in the future, ALS context would need to be serialised and passed explicitly as `workerData` rather than being inherited automatically.

---
description: "Use when writing or reviewing backend app code. Covers hexagonal architecture layers, use-case creation, port/adapter patterns, and handler wiring."
applyTo: "apps/ced-portal-be/**"
---

# Backend — Hexagonal Architecture

The backend follows **hexagonal (ports & adapters) architecture**. Respect layer boundaries strictly.

## Directory Layout

```
src/
├── main.ts                          # Composition root — wires adapters to use cases
├── migrate.ts                       # Database migration entry point
├── application/
│   ├── ports/                       # Port interfaces (contracts)
│   │   └── <name>.port.ts
│   └── use-cases/                   # Business logic
│       ├── <name>.use-case.ts
│       └── __tests__/
│           └── <name>.use-case.test.ts
└── adapters/
    ├── inbound/
    │   └── fastify/                 # HTTP handlers
    │       ├── <name>.handler.ts
    │       └── index.ts             # Re-exports mount* functions
    └── outbound/
        ├── drizzle/                 # Database adapter
        │   ├── client.ts
        │   ├── <name>.<tech>.ts     # Port implementation
        │   └── schema/
        └── redis/                   # Cache/session adapter
            ├── client.ts
            └── <name>.<tech>.ts     # Port implementation
```

## Layer Rules

### Ports (`application/ports/`)

- Define **interfaces** that use cases depend on
- File naming: `<name>.port.ts`
- All methods return `Promise<Result<T, BaseError>>` using `neverthrow`
- Ports belong to the **application layer** — they never import from adapters

```ts
// application/ports/session-store.port.ts
export interface SessionStore {
  readonly getSession: (token: string) => Promise<Result<Session, BaseError>>;
}
```

### Use Cases (`application/use-cases/`)

- File naming: `<name>.use-case.ts`
- A use case is a function matching the `UseCase<Input, Output, Error>` type from `@pagopa/io-core-domain`
- Use cases that need dependencies use a **factory pattern** (`make<Name>UseCase`) that receives port interfaces
- Simple use cases without dependencies are plain `const` functions (`get<Name>UseCase`)
- Use cases **only import from ports and domain** — never from adapters or framework code
- Validate input with Zod schemas inside the use case when needed

```ts
// Factory pattern (has dependencies)
export const makeAcsUseCase =
  (sessionStore: SessionStore, operatorStore: OperatorStore): UseCase<AcsInput, AcsOutput, BaseError> =>
  async (input) => { ... };

// Simple pattern (no dependencies)
export const getInfoUseCase: UseCase<{}, InfoOutput, BaseError> = async () => ok({ ... });
```

### Inbound Adapters (`adapters/inbound/`)

- HTTP handlers mount routes on the Fastify instance
- File naming: `<name>.handler.ts`
- Export a `mount<Name>Handler` function that takes `(fastify, useCase)`
- Use `createHttpHandler` and `createHttpRequestValidator` from `@pagopa/io-core-adapter-fastify`
- Handlers validate HTTP input then delegate to the use case — no business logic here

### Outbound Adapters (`adapters/outbound/`)

- Implement port interfaces using a specific technology
- File naming: `<name>.<technology>.ts` (e.g., `operator-store.drizzle.ts`, `session-store.redis.ts`)
- Export a factory: `create<Technology><Name>` (e.g., `createDrizzleOperatorStore`, `createRedisSessionStore`)
- Wrap all external calls in try/catch and return `Result` types

## Composition Root (`main.ts`)

All wiring happens in `main.ts`:

1. Create adapter instances (clients, stores)
2. Build use cases by injecting adapter instances into factory functions
3. Mount handlers with use cases on the Fastify app
4. Register `onClose` hooks for cleanup

**Never** import use cases inside adapter code or adapters inside port definitions.

## Testing

- Unit test use cases by mocking port interfaces
- Place tests in `application/use-cases/__tests__/`
- Create mock factories: `createMock<Name>Store()` returning the port interface with `vi.fn()` methods
- Assert on `Result` using `.isOk()`, `._unsafeUnwrap()`, `.isErr()`

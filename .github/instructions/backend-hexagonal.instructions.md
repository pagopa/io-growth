---
description: "Use when writing or reviewing backend app code. Covers hexagonal architecture layers, use-case creation, port/adapter patterns, and handler wiring."
applyTo: "apps/*-be/**"
---

# Backend — Hexagonal Architecture

The backend follows **hexagonal (ports & adapters) architecture**. Respect layer boundaries strictly.

## Directory Layout

```
src/
├── main.ts                          # Composition root — wires adapters to use cases
├── migrate.ts                       # Database migration entry point
├── domain/
│   ├── entities/                    # Domain entities (plain types)
│   │   └── <name>.ts
│   └── ports/
│       └── outbound/                # Port interfaces (contracts)
│           ├── <name>.repository.ts
│           └── persistence/
│               └── <name>.repository.ts
├── application/
│   └── use-cases/                   # Business logic
│       ├── <domain>/
│       │   ├── <name>.use-case.ts
│       │   └── __tests__/
│       │       ├── <name>.use-case.test.ts
│       │       └── mocks.ts
│       └── utils/
└── adapters/
    ├── inbound/
    │   └── fastify/                 # HTTP handlers
    │       ├── <domain>/
    │       │   └── <name>.handler.ts
    │       ├── contracts/           # OpenAPI-generated types
    │       └── index.ts             # Re-exports mount* functions
    └── outbound/
        ├── drizzle/                 # Database adapter
        │   ├── client.ts
        │   ├── drizzle-<name>.repository.ts
        │   └── schema/
        └── redis/                   # Cache/session adapter
            ├── client.ts
            └── redis-<name>.repository.ts
```

## Layer Rules

### Domain Entities (`domain/entities/`)

- Plain TypeScript types/interfaces representing domain concepts
- File naming: `<name>.ts` (e.g., `operator.ts`, `place.ts`, `session.ts`)
- No dependencies on external libraries (except value object types)

### Ports (`domain/ports/outbound/`)

- Define **interfaces** that use cases depend on
- File naming: `<name>.repository.ts` (e.g., `session.repository.ts`, `place.repository.ts`)
- All methods return `Promise<Result<T, BaseError>>` using `neverthrow`
- Ports belong to the **domain layer** — they never import from adapters or application

```ts
// domain/ports/outbound/persistence/session.repository.ts
export interface SessionRepository {
  readonly getSession: (
    sessionToken: string,
  ) => Promise<Result<Session, BaseError>>;
  readonly createSession: (
    sessionToken: string,
    session: Session,
  ) => Promise<Result<void, BaseError>>;
}
```

### Use Cases (`application/use-cases/`)

- File naming: `<name>.use-case.ts`
- Organized by domain: `auth/`, `health/`, `places/`, `profile/`
- A use case is a function matching the `UseCase<Input, Output, Error>` type from `@pagopa/io-core-domain`
- Use cases that need dependencies use a **factory pattern** (`make<Name>UseCase`) that receives port interfaces
- Simple use cases without dependencies are plain `const` functions
- Use cases **only import from ports and domain** — never from adapters or framework code
- Validate input with Zod schemas using `validateUseCaseInput` utility

```ts
// Factory pattern (has dependencies)
export const makeGetOperatorPlaceUseCase =
  (placeRepository: PlaceRepository): GetOperatorPlaceUseCase =>
  async (input) =>
    validateUseCaseInput(GetOperatorPlaceInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(placeRepository.getById(validatedInput)).andThen(
          (data) =>
            data ? ok(data) : err(new NotFoundError("Place", "not found")),
        ),
    );
```

### Inbound Adapters (`adapters/inbound/fastify/`)

- HTTP handlers mount routes on the Fastify instance
- File naming: `<name>.handler.ts` inside a domain folder
- Export a `mount<Name>Handler` function that takes `(fastify, useCase)`
- Use `createHttpHandler`, `createHttpRequestValidator`, `createHttpResponseFormatter`, and `withSession` from `@pagopa/io-core-adapter-fastify`
- Handlers validate HTTP input then delegate to the use case — no business logic here

### Outbound Adapters (`adapters/outbound/`)

- Implement port interfaces using a specific technology
- File naming: `<technology>-<name>.repository.ts` (e.g., `drizzle-operator.repository.ts`, `redis-session.repository.ts`)
- Export a factory: `create<Technology><Name>Repository` (e.g., `createDrizzleOperatorRepository`, `createRedisSessionRepository`)
- Wrap all external calls in try/catch and return `Result` types

## Composition Root (`main.ts`)

All wiring happens in `main.ts`:

1. Create adapter instances (clients, repositories)
2. Build use cases by injecting repository instances into factory functions
3. Mount handlers with use cases on the Fastify app
4. Register `onClose` hooks for cleanup

**Never** import use cases inside adapter code or adapters inside port definitions.

## Testing

- Unit test use cases by mocking port interfaces
- Place tests in `application/use-cases/<domain>/__tests__/`
- Create mock factories in a shared `mocks.ts` file: `createMock<Name>Repository()` returning the port interface with `vi.fn()` methods
- Assert on `Result` using `expect(result).toEqual(ok(...))` and `expect(result).toEqual(err(...))`
- Use `expect.objectContaining({ kind: "NotFoundError" })` or `expect.any(NotFoundError)` inside `err()` for error assertions
- **Never** use `._unsafeUnwrap()` or `._unsafeUnwrapErr()` in tests — always assert on the full `Result`

```ts
// ✅ Correct assertion patterns
expect(result).toEqual(ok(expectedValue));
expect(result).toEqual(ok(expect.objectContaining({ name: "test" })));
expect(result).toEqual(err(expect.objectContaining({ kind: "NotFoundError" })));
expect(result).toEqual(err(expect.any(GenericError)));

// ❌ Never do this
const value = result._unsafeUnwrap();
expect(value).toEqual(...);
```

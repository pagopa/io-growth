---
description: "Use when writing or reviewing shared domain package code. Covers error types, use-case type, value objects, and export conventions."
applyTo: "packages/io-core-domain/**"
---

# Domain Package (`@pagopa/io-core-domain`)

The shared domain package contains types, errors, and contracts used across all apps and adapters.

## Exports

The package has three entry points:

| Import                                 | Contents                                                 |
| -------------------------------------- | -------------------------------------------------------- |
| `@pagopa/io-core-domain`               | `UseCase` type, `InputValidator` type, re-exports errors |
| `@pagopa/io-core-domain/errors`        | `BaseError` and all error subclasses                     |
| `@pagopa/io-core-domain/value-objects` | Branded types and value object utilities                 |

## Error Hierarchy

All errors extend `BaseError`. Each has a `kind` (string literal) and `tag` for pattern matching:

- `ValidationError` — Invalid input
- `NotFoundError` — Resource not found (takes entity name and id)
- `ConflictError` — Duplicate or conflicting state
- `ForbiddenError` — Authorization failure
- `GenericError` — Unclassified errors (wrap unexpected failures)

When creating new error types, extend `BaseError` and set unique `kind` and `tag` values.

## UseCase Type

```ts
type UseCase<Input extends object, Output, Error extends BaseError> = (
  input: Input,
) => Promise<Result<Output, Error>>;
```

All use cases across all apps must conform to this signature. Return `Result` from `neverthrow`, never throw.

## Adding New Domain Concepts

- Entities go in `src/entities/`
- Value objects go in `src/value-objects/`
- Inbound port types go in `src/ports/inbound/`
- Re-export new public types from the appropriate entry point (`src/index.ts` or subpath exports in `package.json`)

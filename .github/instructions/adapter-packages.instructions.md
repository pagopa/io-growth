---
description: "Use when writing or reviewing code in adapter packages (packages/io-core-adapter-*). Covers naming conventions, and hexagonal architecture rules for service-integration adapters."
applyTo: "packages/io-core-adapter-*/**"
---

# Adapter Package Conventions

## Function Naming

Do **not** prefix exported function names with the technology or adapter name. The package name already provides the namespace — callers import from the package, so the prefix is redundant.

**Wrong:**

```ts
// packages/io-core-adapter-redis/src/operations.ts
export const redisGet = ...
export const redisSet = ...
export const redisDel = ...
```

**Correct:**

```ts
// packages/io-core-adapter-redis/src/operations.ts
export const get = ...
export const set = ...
export const del = ...
```

This applies to all `io-core-adapter-*` packages (redis, drizzle, fastify, etc.). The caller's import already carries the context:

```ts
import { get, set, del } from "@pagopa/io-core-adapter-redis";
```

## Hexagonal Adapter Packages (Service Integrations)

Adapter packages that integrate **external services or APIs** and need to expose domain ports, outbound adapters, and entity types must follow the same hexagonal architecture rules defined in the [backend hexagonal instructions](backend-hexagonal.instructions.md). Simple utility adapters (redis, drizzle, fastify) that only export functions and types keep their flat structure.

**Examples**: `io-core-adapter-fims` (OIDC/lollipop integration), `io-core-adapter-ar` (Area Riservata API client).

### Directory Layout

```
src/
├── index.ts                        # Barrel exports
├── config.ts                       # Configuration types and builders
├── domain/
│   ├── entities.ts                 # Domain entities (plain types)
│   └── ports/
│       └── outbound/               # Port interfaces (contracts)
│           └── <name>.repository.ts
├── adapters/
│   └── outbound/                   # Adapter implementations
│       └── <name>.ts
└── generated/                      # Auto-generated code (gitignored)
```

### Port Interfaces (`domain/ports/outbound/`)

Same rules as backend ports:

- All methods return `Promise<Result<T, BaseError>>` using `neverthrow`
- All methods are `readonly`
- Ports never import from adapters or application layers

```ts
// domain/ports/outbound/delegation.repository.ts
export interface DelegationRepository {
  readonly getDelegations: (
    params: GetDelegationsParams,
  ) => Promise<Result<DelegationResponse[], GenericError>>;
}
```

### Adapter Implementations (`adapters/outbound/`)

Same rules as backend outbound adapters:

- Export a factory function: `create<Name>Client` (e.g., `createDelegationClient`)
- Wrap all external calls in try/catch and return `Result` types
- The factory receives a configuration object for runtime settings (base URL, auth headers, etc.)

```ts
// adapters/outbound/delegation.ts
export const createDelegationClient = (
  config: ArClientConfig,
): DelegationRepository => ({
  getDelegations: async (params) => {
    try {
      const data = await generatedFetchFn({ ...params, config });
      return ok(data);
    } catch (error) {
      return err(new GenericError(`getDelegations failed: ${String(error)}`));
    }
  },
});
```

### Code Generation

When using code generation tools (e.g., orval for OpenAPI clients):

- Generated output goes in `src/generated/` and **must be gitignored**
- Define a `"generate"` script in `package.json`
- The `generate` turbo task must run **before** `build`
- Use orval's `override.mutator` to inject a custom fetcher that accepts runtime configuration (base URL, auth headers)

### Barrel Exports (`index.ts`)

Export in this order:

1. Port interface types (`domain/ports/outbound/`)
2. Adapter factory functions (`adapters/outbound/`)
3. Configuration types and builders (`config.ts`)
4. Domain entity types (`domain/entities.ts`)

Use `.js` extensions in all import paths (ESM resolution). Use `type` imports for type-only exports.

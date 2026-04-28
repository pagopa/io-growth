---
description: "Use when writing or reviewing code in adapter packages (packages/io-core-adapter-*). Covers naming conventions for exported functions and types."
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

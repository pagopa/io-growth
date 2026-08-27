# @pagopa/io-core-adapter-ar

## 0.1.0

### Minor Changes

- 1dfaa7e: Introduce `@pagopa/io-core-environment-router`, a generic, framework-agnostic
  `EnvRouter<T>` that wraps prod/test singletons of an arbitrary client and routes
  per request via an injected lazy predicate. The AR adapter and `ced-portal-be`
  now build their Drizzle and AR clients explicitly in the app composition root
  and inject the router into the hexagonal dependencies, removing package-side
  auto-configuration and duplicate instantiation. Patched tracing to stringify payload
  data only on local environment.

## 0.0.8

### Patch Changes

- Updated dependencies [6e01232]
  - @pagopa/io-core-domain@0.0.5

## 0.0.7

### Patch Changes

- 1e8e656: change approve api to publish an opportunity and refresh materialized views

## 0.0.6

### Patch Changes

- 2870ce6: add onboarding manager info

## 0.0.5

### Patch Changes

- 7b0924a: Support multi-status filtering for onboarding list API.Expand onboarding detail payload with full AR-backed fields.

## 0.0.4

### Patch Changes

- Updated dependencies [40aaab7]
  - @pagopa/io-core-domain@0.0.4

## 0.0.3

### Patch Changes

- 83b2513: fix module resolution

## 0.0.2

### Patch Changes

- ea6b48c: added AR intgration

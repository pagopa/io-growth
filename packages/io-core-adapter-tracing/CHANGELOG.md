# @pagopa/io-core-adapter-tracing

## 0.0.7

### Patch Changes

- 1dfaa7e: Introduce `@pagopa/io-core-environment-router`, a generic, framework-agnostic
  `EnvRouter<T>` that wraps prod/test singletons of an arbitrary client and routes
  per request via an injected lazy predicate. The AR adapter and `ced-portal-be`
  now build their Drizzle and AR clients explicitly in the app composition root
  and inject the router into the hexagonal dependencies, removing package-side
  auto-configuration and duplicate instantiation. Patched tracing to stringify payload
  data only on local environment.

## 0.0.6

### Patch Changes

- 89fa17c: Added error tracing

## 0.0.5

### Patch Changes

- 13a5a52: fixed monitor init

## 0.0.4

### Patch Changes

- 5ec384d: fixed telemetry init

## 0.0.3

### Patch Changes

- d146483: integrated error logging and audits

## 0.0.2

### Patch Changes

- c92a9f0: Abstracted service name into infra

## 0.0.1

### Patch Changes

- 15c464d: Added azure tracing adapter with hooks for fastify.

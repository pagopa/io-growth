---
"@pagopa/io-core-environment-router": minor
"@pagopa/io-core-adapter-ar": minor
"ced-portal-be": minor
---

Introduce `@pagopa/io-core-environment-router`, a generic, framework-agnostic
`EnvRouter<T>` that wraps prod/test singletons of an arbitrary client and routes
per request via an injected lazy predicate. The AR adapter and `ced-portal-be`
now build their Drizzle and AR clients explicitly in the app composition root
and inject the router into the hexagonal dependencies, removing package-side
auto-configuration and duplicate instantiation.

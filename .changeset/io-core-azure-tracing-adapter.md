---
"@pagopa/io-core-adapter-azure-tracing": minor
"ced-portal-be": patch
---

Add `@pagopa/io-core-adapter-azure-tracing`: a hexagonal adapter wrapping `@pagopa/azure-tracing` for Azure Application Insights telemetry. It exposes a `TelemetryClient` port, a Fastify plugin that auto-tracks endpoint results and exceptions, an `initTelemetry` initializer, and an `emitCustomEvent` facade. Wired into `ced-portal-be`.

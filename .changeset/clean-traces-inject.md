---
"ced-portal-be": patch
---

Decouple the application layer from the tracing package by injecting a `TracingRepository` port; `executeWithTracing` becomes `traceExecution` in the tracing adapter.

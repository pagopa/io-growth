---
"@pagopa/io-core-adapter-inps-ced": patch
---

Recover the INPS response body when the mTLS connection is terminated after a non-2xx response. `customFetch` now drains the body stream chunk-by-chunk instead of `Response.text()`, so a ProblemDetails payload that INPS sends right before closing the socket is preserved. The payload is surfaced in telemetry (`trackException`) and parsed for adapter error mapping, replacing the opaque `TypeError: terminated` trace.

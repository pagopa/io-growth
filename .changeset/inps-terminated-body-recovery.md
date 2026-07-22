---
"@pagopa/io-core-adapter-inps-ced": patch
---

Recover the INPS response body when the mTLS connection is terminated after a non-2xx response. `customFetch` now drains the body stream chunk-by-chunk instead of `Response.text()`, so a ProblemDetails payload that INPS sends right before closing the socket is preserved. The payload is surfaced in telemetry (`trackException`) and parsed for adapter error mapping, replacing the opaque `TypeError: terminated` trace.

`customFetch` also requests `Accept-Encoding: identity`. undici otherwise auto-adds `gzip, deflate`, so INPS gzips the response; when the connection closes without a clean TLS `close_notify`, the truncated gzip stream decompresses to zero bytes and the payload is lost (`rejected: undefined`). Plain `curl` sends no `Accept-Encoding`, which is why it always showed the payload — requesting `identity` matches that behaviour and keeps the uncompressed body recoverable.

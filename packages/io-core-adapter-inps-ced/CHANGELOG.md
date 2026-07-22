# @pagopa/io-core-adapter-inps-ced

## 0.0.3

### Patch Changes

- c931177: Recover the INPS response body when the mTLS connection is terminated after a non-2xx response. `customFetch` now drains the body stream chunk-by-chunk instead of `Response.text()`, so a ProblemDetails payload that INPS sends right before closing the socket is preserved. The payload is surfaced in telemetry (`trackException`) and parsed for adapter error mapping, replacing the opaque `TypeError: terminated` trace.

## 0.0.2

### Patch Changes

- 6e01232: added card request bff api
- Updated dependencies [6e01232]
  - @pagopa/io-core-adapter-modi@0.0.2
  - @pagopa/io-core-domain@0.0.5

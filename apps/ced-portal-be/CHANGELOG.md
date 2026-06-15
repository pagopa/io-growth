# ced-portal-be

## 0.1.0

### Minor Changes

- 67efe9b: GET /api/opportunities admin list endpoint with full filtering (IEG-2827)

## 0.0.21

### Patch Changes

- 2870ce6: add onboarding manager info
- Updated dependencies [2870ce6]
  - @pagopa/io-core-adapter-ar@0.0.6

## 0.0.20

### Patch Changes

- 7b0924a: Support multi-status filtering for onboarding list API.Expand onboarding detail payload with full AR-backed fields.
- Updated dependencies [7b0924a]
  - @pagopa/io-core-adapter-ar@0.0.5

## 0.0.19

### Patch Changes

- 5ec384d: fixed telemetry init
- Updated dependencies [5ec384d]
  - @pagopa/io-core-adapter-tracing@0.0.4

## 0.0.18

### Patch Changes

- 40aaab7: Added string utils
- Updated dependencies [40aaab7]
  - @pagopa/io-core-domain@0.0.4
  - @pagopa/io-core-adapter-ar@0.0.4
  - @pagopa/io-core-adapter-fastify@0.0.5
  - @pagopa/io-core-adapter-redis@0.0.8

## 0.0.17

### Patch Changes

- d146483: integrated error logging and audits
- Updated dependencies [d146483]
  - @pagopa/io-core-adapter-drizzle@0.0.3
  - @pagopa/io-core-adapter-tracing@0.0.3
  - @pagopa/io-core-adapter-redis@0.0.7

## 0.0.16

### Patch Changes

- 2287080: add @pagopa/io-core-adapter-fims dependency for fiscal code hashing

## 0.0.15

### Patch Changes

- c92a9f0: Abstracted service name into infra
- Updated dependencies [c92a9f0]
  - @pagopa/io-core-adapter-tracing@0.0.2

## 0.0.14

### Patch Changes

- 15c464d: Added azure tracing adapter with hooks for fastify.
- Updated dependencies [15c464d]
  - @pagopa/io-core-adapter-tracing@0.0.1

## 0.0.13

### Patch Changes

- ce65442: add national territory flag
- 206fbe1: align api to database schema

## 0.0.12

### Patch Changes

- 38c22fa: added payload to create requests

## 0.0.11

### Patch Changes

- Updated dependencies [83b2513]
  - @pagopa/io-core-adapter-ar@0.0.3

## 0.0.10

### Patch Changes

- ea6b48c: added AR intgration
- 8220b8c: added filter category on opportunity list
- Updated dependencies [ea6b48c]
  - @pagopa/io-core-adapter-fastify@0.0.4
  - @pagopa/io-core-adapter-ar@0.0.2

## 0.0.9

### Patch Changes

- 1dd19e8: fix redis client for local connections
- Updated dependencies [1dd19e8]
  - @pagopa/io-core-adapter-redis@0.0.6

## 0.0.8

### Patch Changes

- Updated dependencies [27672b8]
  - @pagopa/io-core-adapter-redis@0.0.5

## 0.0.7

### Patch Changes

- Updated dependencies [a6df4db]
  - @pagopa/io-core-adapter-redis@0.0.4

## 0.0.6

### Patch Changes

- Updated dependencies [10cfe73]
  - @pagopa/io-core-adapter-redis@0.0.3

## 0.0.5

### Patch Changes

- 7187aee: patches
- Updated dependencies [7187aee]
  - @pagopa/io-core-adapter-drizzle@0.0.2
  - @pagopa/io-core-adapter-fastify@0.0.3
  - @pagopa/io-core-adapter-redis@0.0.2
  - @pagopa/io-core-domain@0.0.3

## 0.0.4

### Patch Changes

- e22f615: init

## 0.0.3

### Patch Changes

- 1c3f8f6: first release

## 0.0.2

### Patch Changes

- 66fb54b: feat: initialize io-core packages and add health check to ced-portal-be
- Updated dependencies [66fb54b]
  - @pagopa/io-core-adapter-fastify@0.0.2
  - @pagopa/io-core-domain@0.0.2

# @pagopa/io-core-adapter-one-mail

## 0.1.4

### Patch Changes

- Updated dependencies [d704bb8]
  - @pagopa/io-core-domain@0.1.0

## 0.1.3

### Patch Changes

- Updated dependencies [9cfb4ed]
  - @pagopa/io-core-domain@0.0.6

## 0.1.2

### Patch Changes

- 8f9c71e: Stop re-running `generate` inside `build`: turbo already runs it as a dependency, and the duplicate run rewrote `src/generated` while `typecheck` was compiling it.

## 0.1.1

### Patch Changes

- e4e3837: one mail integration

## 0.1.0

### Minor Changes

- cedf2c7: Add OneMail outbound adapter package following hexagonal architecture: implements the Emails and Health operations from the OneMail OpenAPI spec, is configured from the app composition root (base URL + API key, no global state), and supports injectable telemetry to log sent emails and send errors.

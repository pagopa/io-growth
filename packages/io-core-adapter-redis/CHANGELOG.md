# @pagopa/io-core-adapter-redis

## 0.0.12

### Patch Changes

- bb4972f: Fix the Redis client staying blocked forever after a connection loss. The client now keeps a single cluster connection instead of reconnecting on every command, bounds connection (20s) and command (2s) time, replaces a broken connection with `destroy()` instead of waiting on `quit()`, rebuilds it after repeated connection failures (Redis error replies no longer count) and reports node connection errors. node-redis now also closes and reopens node connections that stop answering (idle socket timeout with a periodic PING, reconnecting without ever giving up) and drops queued commands once they time out. The readiness endpoint now answers 503 when the database or Redis is unreachable, and `ced-browser-be` now tracks Redis connection errors too.

## 0.0.11

### Patch Changes

- Updated dependencies [d704bb8]
  - @pagopa/io-core-domain@0.1.0

## 0.0.10

### Patch Changes

- Updated dependencies [9cfb4ed]
  - @pagopa/io-core-domain@0.0.6

## 0.0.9

### Patch Changes

- Updated dependencies [6e01232]
  - @pagopa/io-core-domain@0.0.5

## 0.0.8

### Patch Changes

- Updated dependencies [40aaab7]
  - @pagopa/io-core-domain@0.0.4

## 0.0.7

### Patch Changes

- d146483: integrated error logging and audits

## 0.0.6

### Patch Changes

- 1dd19e8: fix redis client for local connections

## 0.0.5

### Patch Changes

- 27672b8: fixed connection

## 0.0.4

### Patch Changes

- a6df4db: removed minimize connections

## 0.0.3

### Patch Changes

- 10cfe73: minimize connections

## 0.0.2

### Patch Changes

- 7187aee: patches
- Updated dependencies [7187aee]
  - @pagopa/io-core-domain@0.0.3

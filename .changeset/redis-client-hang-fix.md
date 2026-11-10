---
"@pagopa/io-core-adapter-redis": patch
"ced-portal-be": patch
"ced-browser-be": patch
"ced-card-request-be": patch
---

Fix the Redis client staying blocked forever after a connection loss. The client now keeps a single cluster connection instead of reconnecting on every command, bounds connection (20s) and command (2s) time, replaces a broken connection with `destroy()` instead of waiting on `quit()`, rebuilds it after repeated connection failures (Redis error replies no longer count) and reports node connection errors. node-redis now also closes and reopens node connections that stop answering (idle socket timeout with a periodic PING, reconnecting without ever giving up) and drops queued commands once they time out. The readiness endpoint now answers 503 when the database or Redis is unreachable, and `ced-browser-be` now tracks Redis connection errors too.

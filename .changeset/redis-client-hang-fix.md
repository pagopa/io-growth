---
"@pagopa/io-core-adapter-redis": patch
"ced-portal-be": patch
"ced-browser-be": patch
"ced-card-request-be": patch
---

Fix the Redis client staying blocked forever after a connection loss. The client now keeps a single cluster connection instead of reconnecting on every command, bounds connection (20s) and command (2s) time, replaces a broken connection with `destroy()` instead of waiting on `quit()`, rebuilds it after repeated failures and reports node connection errors. The readiness endpoint now answers 503 when the database or Redis is unreachable, and `ced-browser-be` now tracks Redis connection errors too.

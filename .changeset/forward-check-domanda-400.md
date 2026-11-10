---
"@pagopa/io-core-adapter-inps-ced": patch
"ced-card-request-be": patch
---

Map INPS `CheckDomanda` 400 responses to `ValidationError` so `GET /status` returns 400 instead of 500.

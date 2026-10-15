---
"ced-browser-be": minor
"@pagopa/io-core-domain": minor
---

Route database access to the test or prod database per request, based on whether the citizen's fiscal code hash is in `TEST_USERS`, using an AsyncLocalStorage session context and the environment router.

---
"@pagopa/io-core-adapter-ar": patch
"ced-portal-be": minor
---

Add the department contract-revocation endpoint: PATCH /api/department/onboardings/{onboardingId}/revoke.
The operator moves to the revoked status and its published opportunities are suspended in the same transaction.
Its users' active sessions stop working, new logins are refused, and the onboarding is deleted on Area Riservata.

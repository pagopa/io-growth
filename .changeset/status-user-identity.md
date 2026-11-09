---
"ced-card-request-be": minor
---

Return the authenticated user's `givenName`, `familyName` and `fiscalCode` in a `user` object from `GET /status`, alongside the application state. When `ACCENT_NORMALIZATION_ENABLED` is `true`, trailing accented vowels in the names are rewritten as plain vowel plus apostrophe, as done for the INPS draft.

---
"ced-portal-be": minor
---

Return operator places as a paginated `{ items, total }` response with optional
offset, limit, case-insensitive name search, and online/offline type filters.
Each item includes `associatedOpportunities`, counting linked non-deleted
opportunities. Existing list consumers must adopt the new response shape and
request additional pages.

---
"@pagopa/io-core-email-templates": minor
"ced-portal-be": minor
---

Add the `operator-opportunity-deleted` and `admin-opportunity-deleted` email templates and send them (`ced_operator-opportunity-deleted_v1`, `ced_admin-opportunity-deleted_v1`) when an operator deletes an opportunity. The operator is always notified; the department is notified for every deletable status except `draft`.

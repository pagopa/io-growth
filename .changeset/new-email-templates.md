---
"@pagopa/io-core-email-templates": minor
"ced-portal-be": minor
---

Prefix operator templates and the shared ending partial with `operator-` (`operator-opportunity-approved`, `operator-opportunity-published`, `operator-opportunity-rejected`, `operator-message-ending`) and add the `admin-new-opportunity` template.

Rename operator email template IDs with the `operator-` prefix and email the admin (`admin-new-opportunity`) when an operator requests an opportunity test; the recipient is routed to `ADMIN_EMAIL_ADDRESS_TEST` for test users.

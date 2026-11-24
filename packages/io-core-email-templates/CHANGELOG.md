# @pagopa/io-core-email-templates

## 0.3.0

### Minor Changes

- 8a7b3c7: Add the `admin-opportunity-republish-request` email template and notify the department (`ced_admin-opportunity-republish-request_v1`) when an operator requests the republication of a department-suspended opportunity.
- 6926858: Add the `admin-opportunity-republished` email template and notify the department (`ced_admin-opportunity-republished_v1`) when an operator republishes an opportunity it had suspended.
- 5be4f1a: Add the `admin-revise-opportunity` email template and send it (`ced_admin-revise-opportunity_v1`) instead of `admin-new-opportunity` when an operator re-requests testing after a rejection. The stored change request message is now cleared when the admin approves the opportunity.
- 315f7eb: Add the `admin-opportunity-suspended` email template and notify the department (`ced_admin-opportunity-suspended_v1`) when an operator suspends or schedules the suspension of an opportunity, including the effective date and reason.
- 1de7147: Add the `admin-opportunity-suspension-cancelled` email template and notify the department (`ced_admin-opportunity-suspension-cancelled_v1`) when an operator cancels a scheduled suspension of its opportunity.
- 0648304: Add the `operator-opportunity-deleted` and `admin-opportunity-deleted` email templates and send them (`ced_operator-opportunity-deleted_v1`, `ced_admin-opportunity-deleted_v1`) when an operator deletes an opportunity. The operator is always notified; the department is notified for every deletable status except `draft`.
- a9b0135: Add the `operator-opportunity-republished` email template and notify the operator (`ced_operator-opportunity-republished_v1`) when the department republishes a suspended opportunity.

### Patch Changes

- aae522a: Align opportunity email subjects, HTML and plain-text content with the approved
  screenshots. Add operator suspension, cancellation, republication refusal and
  self-republication confirmations, and supply their transactional notifications
  and publication availability dates.

## 0.2.0

### Minor Changes

- 23b4d5c: Prefix operator templates and the shared ending partial with `operator-` (`operator-opportunity-approved`, `operator-opportunity-published`, `operator-opportunity-rejected`, `operator-message-ending`) and add the `admin-new-opportunity` template.

  Rename operator email template IDs with the `operator-` prefix and email the admin (`admin-new-opportunity`) when an operator requests an opportunity test; the recipient is routed to `ADMIN_EMAIL_ADDRESS_TEST` for test users.

### Patch Changes

- 724f258: Enqueue an `opportunity-rejected` email to the operator when an admin requests changes on an opportunity.

## 0.1.0

### Minor Changes

- e46b30e: Add `io-core-email-templates` package: compiles MJML email templates into typed, parameterized SESv2 `CreateEmailTemplate` objects (`{ TemplateContent: { Html, Subject, Text }, TemplateName }`). `{{variableName}}` placeholders are left unresolved for SES to substitute at send time. Includes the `opportunity-approved`, `opportunity-published`, and `opportunity-rejected` templates.

  Used template in `ced-portal-be` instead of html.

  Updated deps and added fix for orval File to Blob change.

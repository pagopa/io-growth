# @pagopa/io-core-email-templates

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

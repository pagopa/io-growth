# @pagopa/io-core-email-templates

## 0.1.0

### Minor Changes

- e46b30e: Add `io-core-email-templates` package: compiles MJML email templates into typed, parameterized SESv2 `CreateEmailTemplate` objects (`{ TemplateContent: { Html, Subject, Text }, TemplateName }`). `{{variableName}}` placeholders are left unresolved for SES to substitute at send time. Includes the `opportunity-approved`, `opportunity-published`, and `opportunity-rejected` templates.

  Used template in `ced-portal-be` instead of html.

  Updated deps and added fix for orval File to Blob change.

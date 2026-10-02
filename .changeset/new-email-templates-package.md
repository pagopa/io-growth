---
"@pagopa/io-core-email-templates": minor
---

Add `io-core-email-templates` package: compiles MJML email templates into typed, parameterized SESv2 `CreateEmailTemplate` objects (`{ TemplateContent: { Html, Subject, Text }, TemplateName }`). `{{variableName}}` placeholders are left unresolved for SES to substitute at send time. Includes the `opportunity-approved`, `opportunity-published`, and `opportunity-rejected` templates.

# @pagopa/io-core-adapter-one-mail

## 0.1.0

### Minor Changes

- cedf2c7: Add OneMail outbound adapter package following hexagonal architecture: implements the Emails and Health operations from the OneMail OpenAPI spec, is configured from the app composition root (base URL + API key, no global state), and supports injectable telemetry to log sent emails and send errors.

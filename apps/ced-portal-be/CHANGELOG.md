# ced-portal-be

## 0.8.0

### Minor Changes

- be15700: Return operator places as a paginated `{ items, total }` response with optional
  offset, limit, case-insensitive name search, and online/offline type filters.
  Each item includes `associatedOpportunities`, counting linked non-deleted
  opportunities. Existing list consumers must adopt the new response shape and
  request additional pages.
- 10090fa: Add the operator place-deletion endpoint: DELETE /api/operator/places/{placeId}
- 3ef5939: Add the department contract-revocation endpoint: PATCH /api/department/onboardings/{onboardingId}/revoke.
  The operator moves to the revoked status and its published opportunities are suspended in the same transaction.
  Its users' active sessions stop working, new logins are refused, and the onboarding is deleted on Area Riservata.
- 25e4e98: Add the republish request flow: the operator can ask the department to republish an opportunity it suspended, giving a reason; the department approves through the existing republish endpoint, which now also notifies the operator by email, or rejects the request with PATCH /api/opportunities/{opportunityId}/republish/reject.

### Patch Changes

- Updated dependencies [3ef5939]
  - @pagopa/io-core-adapter-ar@0.1.3

## 0.7.1

### Patch Changes

- e46b30e: Add `io-core-email-templates` package: compiles MJML email templates into typed, parameterized SESv2 `CreateEmailTemplate` objects (`{ TemplateContent: { Html, Subject, Text }, TemplateName }`). `{{variableName}}` placeholders are left unresolved for SES to substitute at send time. Includes the `opportunity-approved`, `opportunity-published`, and `opportunity-rejected` templates.

  Used template in `ced-portal-be` instead of html.

  Updated deps and added fix for orval File to Blob change.

- Updated dependencies [e46b30e]
  - @pagopa/io-core-adapter-fastify@0.0.10

## 0.7.0

### Minor Changes

- b1d9d6e: Add the department endpoint to request changes on an opportunity under review: PATCH /api/opportunities/{opportunityId}/request-changes sends the operator a message and sends the opportunity back to draft for editing.

## 0.6.0

### Minor Changes

- de179a4: Add the republish endpoints for suspended opportunities: PATCH /api/opportunities/{opportunityId}/republish (department) and PATCH /api/operator/opportunities/{opportunityId}/republish (operator)

## 0.5.2

### Patch Changes

- 82c1702: Add an authenticated multipart PUT endpoint to replace an operator profile and optionally replace its logo and image. Store validated profile assets as Base64 text under extensionless blob names, with the original image MIME type in blob metadata.
- 82c1702: Require `privacyUrl` and `tosUrl` HTTPS links for operator profiles, persist them, and expose them in portal and browser profile responses.
- Updated dependencies [82c1702]
  - @pagopa/io-core-adapter-azure-blob-storage@0.0.3

## 0.5.1

### Patch Changes

- Updated dependencies [8cc6169]
  - @pagopa/io-core-adapter-fastify@0.0.9

## 0.5.0

### Minor Changes

- b795362: Add the department onboarding-rejection endpoint: PATCH /api/department/onboardings/{onboardingId}/reject

### Patch Changes

- Updated dependencies [b795362]
  - @pagopa/io-core-adapter-ar@0.1.1

## 0.4.3

### Patch Changes

- e4e3837: one mail integration
- Updated dependencies [e4e3837]
  - @pagopa/io-core-adapter-one-mail@0.1.1

## 0.4.2

### Patch Changes

- cc58ed4: Add multipart operator profile creation with validated logo and image uploads to Azure Blob Storage.
- Updated dependencies [cc58ed4]
  - @pagopa/io-core-adapter-azure-blob-storage@0.0.2
  - @pagopa/io-core-adapter-fastify@0.0.8

## 0.4.1

### Patch Changes

- 7b9e58d: Update the ACS callback to accept the assertion token through the Bearer Authorization header and return the one-time session ID as JSON.

## 0.4.0

### Minor Changes

- e4df158: Add the operator opportunity-edit endpoint: PUT /api/operator/opportunities/{opportunityId}.
  The endpoint replaces the complete writable opportunity representation; omitted optional fields are cleared.

## 0.3.1

### Patch Changes

- 5ca837b: added ttl to session

## 0.3.0

### Minor Changes

- 1dfaa7e: Introduce `@pagopa/io-core-environment-router`, a generic, framework-agnostic
  `EnvRouter<T>` that wraps prod/test singletons of an arbitrary client and routes
  per request via an injected lazy predicate. The AR adapter and `ced-portal-be`
  now build their Drizzle and AR clients explicitly in the app composition root
  and inject the router into the hexagonal dependencies, removing package-side
  auto-configuration and duplicate instantiation. Patched tracing to stringify payload
  data only on local environment.

### Patch Changes

- Updated dependencies [1dfaa7e]
  - @pagopa/io-core-environment-router@0.1.0
  - @pagopa/io-core-adapter-ar@0.1.0
  - @pagopa/io-core-adapter-tracing@0.0.7

## 0.2.15

### Patch Changes

- dfeaa7c: align naming convention

## 0.2.14

### Patch Changes

- 545ab4b: Reject non-operator sessions on the 14 operator API routes with 403 instead of a misleading 400.

## 0.2.13

### Patch Changes

- 3b78198: feat: add department suspension API for opportunities

## 0.2.12

### Patch Changes

- 914a2c2: feat: add operator suspension API with scheduled_suspension derived status

## 0.2.11

### Patch Changes

- Updated dependencies [6e01232]
  - @pagopa/io-core-adapter-fastify@0.0.7
  - @pagopa/io-core-domain@0.0.5
  - @pagopa/io-core-adapter-ar@0.0.8
  - @pagopa/io-core-adapter-redis@0.0.9

## 0.2.10

### Patch Changes

- 7f28292: add operator soft-delete API for opportunities (PATCH /operator/opportunities/{id}/delete)

## 0.2.9

### Patch Changes

- 3d07f8b: added a soft status on opportunities named scehduled

## 0.2.8

### Patch Changes

- 6e12e3c: fix count published opportunities by operator

## 0.2.7

### Patch Changes

- 1e8e656: change approve api to publish an opportunity and refresh materialized views
- Updated dependencies [1e8e656]
  - @pagopa/io-core-adapter-ar@0.0.7

## 0.2.6

### Patch Changes

- 04a397d: Department opportunities list: text search now also matches the operator (ente) name, not only the opportunity name.

## 0.2.5

### Patch Changes

- f22d16f: add concurrently option to refresh materialized view

## 0.2.4

### Patch Changes

- 9603c2e: added possibility to migrate cron job
- Updated dependencies [9603c2e]
  - @pagopa/io-core-adapter-drizzle@0.0.4

## 0.2.3

### Patch Changes

- 6f5c703: add profile info and make user info optional

## 0.2.2

### Patch Changes

- b8c4b22: (Chore) Refactored ALS session context

## 0.2.1

### Patch Changes

- 1b6f9a1: add places guard on request test api
- c9baec0: Publish opportunity now returns 412 when the operator has no profile.

## 0.2.0

### Minor Changes

- 49dad7a: add PATCH /operator/opportunities/{opportunityId}/publish endpoint for operator-scoped opportunity publishing

## 0.1.3

### Patch Changes

- Updated dependencies [89fa17c]
  - @pagopa/io-core-adapter-tracing@0.0.6

## 0.1.2

### Patch Changes

- Updated dependencies [13a5a52]
  - @pagopa/io-core-adapter-tracing@0.0.5

## 0.1.1

### Patch Changes

- 1e199aa: manage non json replies and add admin auth on department api
- Updated dependencies [1e199aa]
  - @pagopa/io-core-adapter-fastify@0.0.6

## 0.1.0

### Minor Changes

- 67efe9b: GET /api/opportunities admin list endpoint with full filtering (IEG-2827)

## 0.0.21

### Patch Changes

- 2870ce6: add onboarding manager info
- Updated dependencies [2870ce6]
  - @pagopa/io-core-adapter-ar@0.0.6

## 0.0.20

### Patch Changes

- 7b0924a: Support multi-status filtering for onboarding list API.Expand onboarding detail payload with full AR-backed fields.
- Updated dependencies [7b0924a]
  - @pagopa/io-core-adapter-ar@0.0.5

## 0.0.19

### Patch Changes

- 5ec384d: fixed telemetry init
- Updated dependencies [5ec384d]
  - @pagopa/io-core-adapter-tracing@0.0.4

## 0.0.18

### Patch Changes

- 40aaab7: Added string utils
- Updated dependencies [40aaab7]
  - @pagopa/io-core-domain@0.0.4
  - @pagopa/io-core-adapter-ar@0.0.4
  - @pagopa/io-core-adapter-fastify@0.0.5
  - @pagopa/io-core-adapter-redis@0.0.8

## 0.0.17

### Patch Changes

- d146483: integrated error logging and audits
- Updated dependencies [d146483]
  - @pagopa/io-core-adapter-drizzle@0.0.3
  - @pagopa/io-core-adapter-tracing@0.0.3
  - @pagopa/io-core-adapter-redis@0.0.7

## 0.0.16

### Patch Changes

- 2287080: add @pagopa/io-core-adapter-fims dependency for fiscal code hashing

## 0.0.15

### Patch Changes

- c92a9f0: Abstracted service name into infra
- Updated dependencies [c92a9f0]
  - @pagopa/io-core-adapter-tracing@0.0.2

## 0.0.14

### Patch Changes

- 15c464d: Added azure tracing adapter with hooks for fastify.
- Updated dependencies [15c464d]
  - @pagopa/io-core-adapter-tracing@0.0.1

## 0.0.13

### Patch Changes

- ce65442: add national territory flag
- 206fbe1: align api to database schema

## 0.0.12

### Patch Changes

- 38c22fa: added payload to create requests

## 0.0.11

### Patch Changes

- Updated dependencies [83b2513]
  - @pagopa/io-core-adapter-ar@0.0.3

## 0.0.10

### Patch Changes

- ea6b48c: added AR intgration
- 8220b8c: added filter category on opportunity list
- Updated dependencies [ea6b48c]
  - @pagopa/io-core-adapter-fastify@0.0.4
  - @pagopa/io-core-adapter-ar@0.0.2

## 0.0.9

### Patch Changes

- 1dd19e8: fix redis client for local connections
- Updated dependencies [1dd19e8]
  - @pagopa/io-core-adapter-redis@0.0.6

## 0.0.8

### Patch Changes

- Updated dependencies [27672b8]
  - @pagopa/io-core-adapter-redis@0.0.5

## 0.0.7

### Patch Changes

- Updated dependencies [a6df4db]
  - @pagopa/io-core-adapter-redis@0.0.4

## 0.0.6

### Patch Changes

- Updated dependencies [10cfe73]
  - @pagopa/io-core-adapter-redis@0.0.3

## 0.0.5

### Patch Changes

- 7187aee: patches
- Updated dependencies [7187aee]
  - @pagopa/io-core-adapter-drizzle@0.0.2
  - @pagopa/io-core-adapter-fastify@0.0.3
  - @pagopa/io-core-adapter-redis@0.0.2
  - @pagopa/io-core-domain@0.0.3

## 0.0.4

### Patch Changes

- e22f615: init

## 0.0.3

### Patch Changes

- 1c3f8f6: first release

## 0.0.2

### Patch Changes

- 66fb54b: feat: initialize io-core packages and add health check to ced-portal-be
- Updated dependencies [66fb54b]
  - @pagopa/io-core-adapter-fastify@0.0.2
  - @pagopa/io-core-domain@0.0.2

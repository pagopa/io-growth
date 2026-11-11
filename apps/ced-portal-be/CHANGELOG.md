# ced-portal-be

## 0.13.0

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

## 0.12.3

### Patch Changes

- bb4972f: Fix the Redis client staying blocked forever after a connection loss. The client now keeps a single cluster connection instead of reconnecting on every command, bounds connection (20s) and command (2s) time, replaces a broken connection with `destroy()` instead of waiting on `quit()`, rebuilds it after repeated connection failures (Redis error replies no longer count) and reports node connection errors. node-redis now also closes and reopens node connections that stop answering (idle socket timeout with a periodic PING, reconnecting without ever giving up) and drops queued commands once they time out. The readiness endpoint now answers 503 when the database or Redis is unreachable, and `ced-browser-be` now tracks Redis connection errors too.
- Updated dependencies [bb4972f]
  - @pagopa/io-core-adapter-redis@0.0.12

## 0.12.2

### Patch Changes

- b7402fd: Validate support contact email addresses, phone numbers, and HTTPS websites before creating places or saving operator profiles, and require HTTPS for online place websites and opportunity URLs. Use case validation errors now use the same readable `[path]: message` format as request validation errors. The shared domain package now exports the HTTPS URL value object for reuse.
- Updated dependencies [b7402fd]
  - @pagopa/io-core-domain@0.1.1

## 0.12.1

### Patch Changes

- 67578cc: added version to templates

## 0.12.0

### Minor Changes

- 23b4d5c: Prefix operator templates and the shared ending partial with `operator-` (`operator-opportunity-approved`, `operator-opportunity-published`, `operator-opportunity-rejected`, `operator-message-ending`) and add the `admin-new-opportunity` template.

  Rename operator email template IDs with the `operator-` prefix and email the admin (`admin-new-opportunity`) when an operator requests an opportunity test; the recipient is routed to `ADMIN_EMAIL_ADDRESS_TEST` for test users.

- 724f258: Enqueue an `opportunity-rejected` email to the operator when an admin requests changes on an opportunity.

## 0.11.0

### Minor Changes

- dd9a761: Replace opportunity category title and description with a label (`id` + `label` only); portal responses expose `categoryLabel` instead of `categoryTitle`, browser `category` now carries the label.

## 0.10.3

### Patch Changes

- 34319d0: Bump `image-size` to 2.0.3 and `react-router-dom` to 6.30.6.

## 0.10.2

### Patch Changes

- c18a6cc: Implemented env router

## 0.10.1

### Patch Changes

- Updated dependencies [d704bb8]
  - @pagopa/io-core-domain@0.1.0
  - @pagopa/io-core-adapter-ar@0.1.5
  - @pagopa/io-core-adapter-azure-blob-storage@0.0.5
  - @pagopa/io-core-adapter-fastify@0.0.12
  - @pagopa/io-core-adapter-one-mail@0.1.4
  - @pagopa/io-core-adapter-redis@0.0.11

## 0.10.0

### Minor Changes

- acddd6a: Verify issuer, expiration and signature (via the issuer's JWKS) of the Area Riservata token received by ACS

## 0.9.1

### Patch Changes

- 9cfb4ed: Fix the UTC calendar-date assumption that delayed opportunity publication until
  02:00 in Italy during daylight saving time. Use Europe/Rome dates consistently
  in the opportunity and place materialized views, publication notifications,
  citizen detail access, and portal publication checks.
- Updated dependencies [9cfb4ed]
  - @pagopa/io-core-domain@0.0.6
  - @pagopa/io-core-adapter-ar@0.1.4
  - @pagopa/io-core-adapter-azure-blob-storage@0.0.4
  - @pagopa/io-core-adapter-fastify@0.0.11
  - @pagopa/io-core-adapter-one-mail@0.1.3
  - @pagopa/io-core-adapter-redis@0.0.10

## 0.9.0

### Minor Changes

- a12393d: Send approval and publishing emails through a message outbox.

  Send the opportunity "approved" email when the opportunity gets approved.

  Send the opportunity "published" email when the opportunity becomes visible, instead of on republication: a scheduled job enqueues it once per entry into the materialized view, tracked by the new `publishing_notified_at` column and reset by a database trigger. Republication no longer sends an email.

  Decoupled tracing into a port.

  Only the latest Container Apps revision owns the scheduled jobs: the new revision tracker package records revisions in a Postgres table, and the app registers its revision once it is ready. The scheduler knows nothing about revisions: it takes an optional `isOwned` closure and, without it, always runs. Older revisions stay passive and stop rejected jobs. The scheduler stops gracefully on SIGTERM and traces its ownership events through the injected tracing repository.

### Patch Changes

- Updated dependencies [a12393d]
  - @pagopa/io-core-adapter-pgboss@0.1.0
  - @pagopa/io-core-adapter-revision-tracker@0.1.0

## 0.8.2

### Patch Changes

- e9dc8e9: change logo image validation dimensions from vertical to horizontal

## 0.8.1

### Patch Changes

- c019a0d: Change the target status of a change request from draft to test_rejected: an opportunity the department asks changes on now moves to test_rejected instead of draft

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

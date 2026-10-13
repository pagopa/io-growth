# @pagopa/io-core-adapter-pgboss

## 0.1.0

### Minor Changes

- a12393d: Send approval and publishing emails through a message outbox.

  Send the opportunity "approved" email when the opportunity gets approved.

  Send the opportunity "published" email when the opportunity becomes visible, instead of on republication: a scheduled job enqueues it once per entry into the materialized view, tracked by the new `publishing_notified_at` column and reset by a database trigger. Republication no longer sends an email.

  Decoupled tracing into a port.

  Only the latest Container Apps revision owns the scheduled jobs: the new revision tracker package records revisions in a Postgres table, and the app registers its revision once it is ready. The scheduler knows nothing about revisions: it takes an optional `isOwned` closure and, without it, always runs. Older revisions stay passive and stop rejected jobs. The scheduler stops gracefully on SIGTERM and traces its ownership events through the injected tracing repository.

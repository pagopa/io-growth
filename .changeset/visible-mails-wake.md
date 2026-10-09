---
"ced-portal-be": minor
---
Send approval and publishing emails through a message outbox.

Send the opportunity "approved" email when the opportunity gets approved.

Send the opportunity "published" email when the opportunity becomes visible, instead of on republication: a scheduled job enqueues it once per entry into the materialized view, tracked by the new `publishing_notified_at` column and reset by a database trigger. Republication no longer sends an email.

Decoupled tracing into a port.

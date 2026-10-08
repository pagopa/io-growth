---
"ced-portal-be": minor
---

Send opportunity approval and republication emails through a message outbox: the message is stored in the same transaction as the status change and a scheduled job sends pending messages one per second, with at most 3 attempts. Removes the demo job.

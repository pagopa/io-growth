---
"ced-card-request-be": patch
---

Reject missing/expired sessions with 401 instead of a 500 leaking from a second validation gate.

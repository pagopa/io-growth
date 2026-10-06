---
"ced-portal-be": minor
---

Add the republish request flow: the operator can ask the department to republish an opportunity it suspended, giving a reason; the department approves through the existing republish endpoint, which now also notifies the operator by email, or rejects the request with PATCH /api/opportunities/{opportunityId}/republish/reject.

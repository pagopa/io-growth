---
"ced-portal-be": patch
"@pagopa/io-core-domain": patch
---

Validate support contact email addresses, phone numbers, and HTTPS websites before creating places or saving operator profiles, and require HTTPS for online place websites and opportunity URLs. Use case validation errors now use the same readable `[path]: message` format as request validation errors. The shared domain package now exports the HTTPS URL value object for reuse.

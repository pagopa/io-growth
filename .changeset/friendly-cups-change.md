---
"ced-portal-be": patch
"@pagopa/io-core-adapter-azure-blob-storage": patch
---

Add an authenticated multipart PUT endpoint to replace an operator profile and optionally replace its logo and image. Store validated profile assets as Base64 text under extensionless blob names, with the original image MIME type in blob metadata.

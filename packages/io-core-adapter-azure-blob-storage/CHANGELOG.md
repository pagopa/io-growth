# @pagopa/io-core-adapter-azure-blob-storage

## 0.0.3

### Patch Changes

- 82c1702: Add an authenticated multipart PUT endpoint to replace an operator profile and optionally replace its logo and image. Store validated profile assets as Base64 text under extensionless blob names, with the original image MIME type in blob metadata.

## 0.0.2

### Patch Changes

- cc58ed4: Add multipart operator profile creation with validated logo and image uploads to Azure Blob Storage.

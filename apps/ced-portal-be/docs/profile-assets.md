# Profile asset storage

The profile logo and image containers store each asset in a blob named exactly
with the operator ID, without a filename extension. The blob body is the UTF-8
encoding of the file bytes in standard Base64 (without a data-URI prefix).

The blob HTTP `Content-Type` is `text/plain; charset=utf-8`. The original,
validated image MIME type (`image/png` or `image/jpeg`) is stored in blob
metadata under `imagecontenttype`. A consumer that serves an asset as an image
must Base64-decode the body and use this metadata value as the response MIME
type.

Both profile creation and update use this storage format. Updating one asset
overwrites only that asset's extensionless blob; omitting an asset during an
update does not change its existing blob. Upload validation checks the image
signature, declared MIME type, matching `.png`, `.jpg`, or `.jpeg` filename
extension, and the asset-specific dimensions.

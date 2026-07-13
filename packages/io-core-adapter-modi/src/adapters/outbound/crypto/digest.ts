import { createHash } from "node:crypto";

/**
 * Computes the HTTP Digest header value for a request body.
 * Format: `SHA-256=<base64(sha256(body))>`
 *
 * Per AGID ModI INTEGRITY_REST_01, the Digest header is computed over
 * the raw request body before any encoding/compression.
 */
export const computeDigest = (body: Buffer | string | Uint8Array): string => {
  const hash = createHash("sha256").update(body).digest("base64");
  return `SHA-256=${hash}`;
};

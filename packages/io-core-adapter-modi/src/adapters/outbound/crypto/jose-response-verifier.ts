import type { Result } from "neverthrow";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { importX509, jwtVerify } from "jose";
import { err, ok } from "neverthrow";

/**
 * P3 non-repudiation response verifier.
 *
 * After INPS processes a request it returns a signed JWT (placed in the
 * `Agid-JWT-Signature` response header). This verifier:
 *  1. Extracts the leaf certificate from the INPS signing CA chain PEM.
 *  2. Verifies the JWT signature.
 *  3. Asserts `request_digest` claim equals the Digest sent in the request.
 *
 * NOTE: the exact response header name and the structure of the JWT are
 * subject to confirmation from the INPS eService descriptor.
 */
export const createResponseVerifier = (inpsSigningCaChain: string) => ({
  verify: async (
    responseJwt: string,
    sentDigest: string,
  ): Promise<Result<void, UnauthorizedError>> => {
    try {
      const certMatch = inpsSigningCaChain.match(
        /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/,
      );
      if (!certMatch) {
        return err(
          new UnauthorizedError(
            "INPS signing CA chain contains no certificate",
          ),
        );
      }

      const key = await importX509(certMatch[0], "RS256");
      const { payload } = await jwtVerify(responseJwt, key);

      const requestDigest = payload["request_digest"];
      if (requestDigest !== sentDigest) {
        return err(
          new UnauthorizedError(
            `ModI P3 request_digest mismatch: got '${String(requestDigest)}', expected '${sentDigest}'`,
          ),
        );
      }

      return ok(undefined);
    } catch (error) {
      return err(
        new UnauthorizedError(
          `ModI P3 response verification failed: ${String(error)}`,
        ),
      );
    }
  },
});

export type ModiResponseVerifier = ReturnType<typeof createResponseVerifier>;

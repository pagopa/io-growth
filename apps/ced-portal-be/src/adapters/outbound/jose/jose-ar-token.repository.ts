import {
  ServiceUnavailableError,
  UnauthorizedError,
} from "@pagopa/io-core-domain/errors";
import {
  createRemoteJWKSet,
  decodeJwt,
  errors,
  jwtVerify,
  type JWTVerifyGetKey,
} from "jose";
import { err, ok } from "neverthrow";

import type { ArTokenRepository } from "../../../domain/ports/outbound/ar-token.repository.js";

const ALLOWED_ALGORITHMS = ["RS256"];
const CLOCK_TOLERANCE_SECONDS = 5;

export interface JoseArTokenRepositoryDeps {
  readonly createJwks?: (jwksUrl: URL) => JWTVerifyGetKey;
}

// JWKS availability problems are ours/upstream's, not the caller's.
const isJwksUnavailable = (error: unknown): boolean =>
  !(error instanceof errors.JOSEError) ||
  error instanceof errors.JWKSTimeout ||
  error instanceof errors.JWKSInvalid ||
  error.code === errors.JOSEError.code;

export const createJoseArTokenRepository = (
  issuers: readonly string[],
  deps: JoseArTokenRepositoryDeps = {},
): ArTokenRepository => {
  const createJwks = deps.createJwks ?? ((url: URL) => createRemoteJWKSet(url));
  const jwksByIssuer = new Map(
    issuers.map((issuer) => [
      issuer,
      createJwks(new URL(`${issuer}/.well-known/jwks.json`)),
    ]),
  );

  return {
    verifyToken: async (token) => {
      try {
        const { iss } = decodeJwt(token);
        const jwks =
          typeof iss === "string" ? jwksByIssuer.get(iss) : undefined;
        if (!jwks) {
          return err(new UnauthorizedError("Untrusted token issuer"));
        }

        const { payload } = await jwtVerify(token, jwks, {
          algorithms: ALLOWED_ALGORITHMS,
          clockTolerance: CLOCK_TOLERANCE_SECONDS,
          issuer: iss,
          requiredClaims: ["exp", "iss"],
        });
        return ok(payload);
      } catch (error) {
        return err(
          isJwksUnavailable(error)
            ? new ServiceUnavailableError("Unable to retrieve Selfcare JWKS")
            : new UnauthorizedError("Invalid token"),
        );
      }
    },
  };
};

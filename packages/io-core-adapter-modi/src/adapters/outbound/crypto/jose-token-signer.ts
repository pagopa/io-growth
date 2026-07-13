import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { SignJWT } from "jose";
import { err, ok } from "neverthrow";
import { randomUUID } from "node:crypto";

import type { SigningCredentials } from "../../../domain/ports/outbound/credential-provider.port.js";

export interface SignedTokenResult {
  readonly jti: string;
  readonly jwt: string;
}

export interface TokenSignerParams {
  readonly audience: string;
  readonly codiceUfficio: string;
  readonly contentType: string;
  /**
   * SHA-256 body digest (e.g. `"SHA-256=…"`).
   * Required for P2/P3 (INTEGRITY_REST_01); omit for P1 (ID_AUTH_REST_01 only).
   * When absent the JWT carries no body-integrity claims (no `digest`,
   * no `signed_headers`).
   */
  readonly digest?: string;
  readonly issuer: string;
  readonly userId: string;
}

/**
 * AGID ModI request-signing factory.
 *
 * Produces a signed JWT placed in the `Agid-JWT-Signature` header.
 * Behaviour adapts to the ModI profile:
 *
 * - **P1** (`digest` absent): auth-only JWT — iss/sub/aud/iat/nbf/exp/jti +
 *   identity claims. No body-integrity claims.
 * - **P2 / P3** (`digest` present): full integrity JWT — adds `digest`,
 *   `content-type`, INPS identity header claims, and `signed_headers`.
 *
 * NOTE: exact header/claim names are subject to confirmation from the
 * INPS eService descriptor and AGID ModI spec.
 */
export const createTokenSigner = (credentials: SigningCredentials) => ({
  signRequest: async (
    params: TokenSignerParams,
  ): Promise<Result<SignedTokenResult, GenericError>> => {
    try {
      const jti = randomUUID();
      const now = Math.floor(Date.now() / 1000);

      // P2/P3: include body-integrity claims and signed_headers.
      // P1: identity claims only (audit trail without body integrity).
      const integrityPayload = params.digest
        ? {
            "content-type": params.contentType,
            digest: params.digest,
            "inps-identity-codiceufficio": params.codiceUfficio,
            "inps-identity-userid": params.userId,
            signed_headers: [
              "digest",
              "content-type",
              "inps-identity-userid",
              "inps-identity-codiceufficio",
            ].join(" "),
          }
        : {
            // P1: identity claims for audit; no digest/signed_headers
            "inps-identity-codiceufficio": params.codiceUfficio,
            "inps-identity-userid": params.userId,
          };

      const jwt = await new SignJWT(integrityPayload)
        .setProtectedHeader({
          alg: "RS256",
          x5c: [...credentials.x5c],
        })
        .setIssuedAt(now)
        .setNotBefore(now)
        .setExpirationTime(now + 300)
        .setJti(jti)
        .setIssuer(params.issuer)
        .setSubject(params.issuer)
        .setAudience(params.audience)
        .sign(credentials.privateKey);

      return ok({ jti, jwt });
    } catch (error) {
      return err(new GenericError(`Token signing failed: ${String(error)}`));
    }
  },
});

export type ModiTokenSigner = ReturnType<typeof createTokenSigner>;

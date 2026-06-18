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
  readonly digest: string;
  readonly issuer: string;
  readonly userId: string;
}

/**
 * AGID ModI P3 request-signing factory (INTEGRITY_REST_01 / ID_AUTH_REST_01).
 *
 * Produces a signed JWT placed in the `Agid-JWT-Signature` header.
 * The JWT includes:
 *  - x5c header: DER-base64 signing cert chain (leaf first)
 *  - signed_headers: space-separated list of headers covered by the JWT
 *  - digest / content-type / identity claims matching the signed headers
 *  - standard JOSE claims: iss, sub, aud, iat, nbf, exp (5 min), jti
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

      const signedHeaders = [
        "digest",
        "content-type",
        "inps-identity-userid",
        "inps-identity-codiceufficio",
      ].join(" ");

      const jwt = await new SignJWT({
        "content-type": params.contentType,
        digest: params.digest,
        "inps-identity-codiceufficio": params.codiceUfficio,
        "inps-identity-userid": params.userId,
        signed_headers: signedHeaders,
      })
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

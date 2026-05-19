import type { Verifier } from "@mattrglobal/http-signatures";
import type { JWK } from "jose";
import type { Result } from "neverthrow";
import type { JsonWebKey } from "node:crypto";

import { verifySignatureHeader } from "@mattrglobal/http-signatures";
import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import {
  constants,
  createPublicKey,
  verify as cryptoVerify,
} from "node:crypto";

import type { LollipopHeaders } from "../../../domain/entities.js";

import { getAlgoFromAssertionRef } from "./thumbprint.js";

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

/**
 * Custom verifier that handles ECDSA signatures in DER encoding.
 *
 * The FIMS lollipop protocol sends ECDSA signatures DER-encoded (standard JOSE
 * format), but `@mattrglobal/http-signatures`' built-in keyMap verifier expects
 * IEEE P1363 encoding (raw r||s). Using the library's keyMap would therefore
 * cause all EC-key lollipop verifications to fail in production.
 *
 * This function builds a `Verifier` with a fully custom `verify` callback that:
 * - For `ecdsa-p256-sha256`: uses `node:crypto.verify` with `{ dsaEncoding: "der" }`.
 * - For `rsa-pss-sha256`: uses `node:crypto.verify` with PSS padding.
 *
 * References:
 * - io-cdc `utils/httpSignature.verifiers.ts` `getCustomVerifyWithEncoding("der")`
 */
const buildDerAwareVerifier = (
  thumbprint: string,
  publicKey: JWK,
): Verifier => ({
  verify: async (
    params: { readonly alg: string; readonly keyid: string },
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> => {
    if (params.keyid !== thumbprint) return false;
    try {
      const cryptoKey = createPublicKey({
        format: "jwk",
        key: publicKey as JsonWebKey,
      });
      if (params.alg === "ecdsa-p256-sha256") {
        return cryptoVerify(
          "SHA256",
          data,
          { dsaEncoding: "der", key: cryptoKey },
          signature,
        );
      }
      if (params.alg === "rsa-pss-sha256") {
        return cryptoVerify(
          "SHA256",
          data,
          {
            key: cryptoKey,
            padding: constants.RSA_PKCS1_PSS_PADDING,
            saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
          },
          signature,
        );
      }
      return false;
    } catch {
      return false;
    }
  },
});

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Verify the HTTP message signature (signature + signature-input headers)
 * using the user's public key.
 *
 * Uses a DER-aware custom verifier so that ECDSA signatures encoded as DER
 * (which is what the FIMS lollipop protocol produces) are correctly verified.
 * The thumbprint (derived from assertionRef) is used as the keyId so it is
 * matched against the `signature-input` header.
 */
export const verifyHttpSignature = async (
  assertionRef: string,
  headers: LollipopHeaders,
  url: string,
  publicKey: JWK,
): Promise<Result<true, UnauthorizedError>> => {
  const algo = getAlgoFromAssertionRef(assertionRef);
  const thumbprint = assertionRef.slice(`${algo}-`.length);

  const verifier = buildDerAwareVerifier(thumbprint, publicKey);

  const result = await verifySignatureHeader({
    httpHeaders: headers as unknown as Record<string, string>,
    method: "GET",
    url,
    verifier,
  });

  if (result.isErr()) {
    return err(
      new UnauthorizedError(
        `HTTP signature verification error: ${result.error.message}`,
      ),
    );
  }

  const verification = result.value;
  if (!verification.verified) {
    return err(
      new UnauthorizedError(
        `HTTP signature not verified: ${JSON.stringify(verification.reason)}`,
      ),
    );
  }

  return ok(true);
};

/**
 * Verify that the `nonce` component of the `signature-input` header matches
 * the OIDC `state` parameter. Mirrors io-cdc `verifyState`.
 */
export const verifyStateInSignature = (
  signatureInput: string,
  state: string,
): Result<true, UnauthorizedError> => {
  const nonce = signatureInput
    .split(";")
    .find((t) => t.includes("nonce"))
    ?.replaceAll("nonce=", "")
    .replaceAll('"', "")
    .trim();

  if (nonce !== state) {
    return err(
      new UnauthorizedError(
        `State mismatch: nonce in signature-input (${String(nonce)}) !== state (${state})`,
      ),
    );
  }
  return ok(true);
};

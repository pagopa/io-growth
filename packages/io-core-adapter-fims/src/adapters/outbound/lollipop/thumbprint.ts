import type { JWK } from "jose";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { calculateJwkThumbprint } from "jose";
import { err, ok } from "neverthrow";

export type HashAlgorithm = "sha256" | "sha384" | "sha512";

/**
 * Calculate the RFC 7638 JWK thumbprint of a public key.
 * Used to verify the `assertion_ref` field from FIMS matches the provided public key.
 */
export const calculateThumbprint = async (
  jwk: JWK,
  algo: HashAlgorithm,
): Promise<Result<string, GenericError>> => {
  try {
    const thumbprint = await calculateJwkThumbprint(jwk, algo);
    return ok(thumbprint);
  } catch (error) {
    return err(
      new GenericError(`Cannot calculate JWK thumbprint: ${String(error)}`),
    );
  }
};

/**
 * Infer the hash algorithm from an `assertion_ref` value
 * (e.g. `sha512-<hash>` → `"sha512"`).
 */
export const getAlgoFromAssertionRef = (
  assertionRef: string,
): HashAlgorithm => {
  if (assertionRef.startsWith("sha512-")) return "sha512";
  if (assertionRef.startsWith("sha384-")) return "sha384";
  return "sha256";
};

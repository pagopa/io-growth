import type { JWK } from "jose";
import type { Result } from "neverthrow";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { FimsUser, LollipopHeaders } from "../../../domain/entities.js";
import type { LollipopVerifier } from "../../../domain/ports/outbound/lollipop-verifier.repository.js";

import {
  verifyHttpSignature,
  verifyStateInSignature,
} from "./http-signature.js";
import {
  getFiscalCodeFromAssertion,
  getInResponseToFromAssertion,
  getIssueInstantFromAssertion,
  parseAssertionXml,
  verifyAssertionSignatures,
} from "./saml.js";
import { calculateThumbprint, getAlgoFromAssertionRef } from "./thumbprint.js";

/**
 * Full lollipop verification for a FIMS callback request.
 *
 * Verifies (in order):
 * 1. SAML assertion XML signatures against PagoPA IDP keys.
 * 2. `public_key` → JWK → thumbprint == `assertion_ref`.
 * 3. `InResponseTo` in assertion == `assertion_ref`.
 * 4. Fiscal code in assertion == `fiscal_code` from FIMS userinfo.
 * 5. Assertion IssueInstant is within 1 year (not expired).
 * 6. HTTP message signatures (signature + signature-input headers).
 * 7. `nonce` in `signature-input` == OIDC `state` parameter.
 *
 * Mirrors the combined `checkAssertion` + `checkLollipop` logic in io-cdc.
 */
export const createLollipopVerifier = (): LollipopVerifier => ({
  verify: async (
    user: FimsUser,
    headers: LollipopHeaders,
    state: string,
    fimsRedirectUrl: string,
    idpKeysBaseUrl: string,
  ): Promise<Result<true, UnauthorizedError>> => {
    // 1. Verify XML assertion signatures using PagoPA IDP keys
    const assertionSigResult = await verifyAssertionSignatures(
      user.assertion,
      idpKeysBaseUrl,
    );
    if (assertionSigResult.isErr()) return err(assertionSigResult.error);

    // 2. Decode public_key from Base64 → JWK
    let publicKey: JWK;
    try {
      publicKey = JSON.parse(
        Buffer.from(user.public_key, "base64").toString("utf-8"),
      ) as JWK;
    } catch {
      return err(
        new UnauthorizedError("Lollipop: cannot decode public_key from base64"),
      );
    }

    // 3. Parse assertion XML
    const parseResult = parseAssertionXml(user.assertion);
    if (parseResult.isErr()) return err(parseResult.error);
    const assertion = parseResult.value;

    // 4. Verify assertion_ref == sha{algo}-{thumbprint(publicKey)}
    const algo = getAlgoFromAssertionRef(user.assertion_ref);
    const thumbprintResult = await calculateThumbprint(publicKey, algo);
    if (thumbprintResult.isErr()) {
      return err(
        new UnauthorizedError(
          `Lollipop thumbprint: ${thumbprintResult.error.message}`,
        ),
      );
    }
    const expectedRef = `${algo}-${thumbprintResult.value}`;
    if (expectedRef !== user.assertion_ref) {
      return err(
        new UnauthorizedError(
          `Lollipop: assertion_ref mismatch (expected ${expectedRef}, got ${user.assertion_ref})`,
        ),
      );
    }

    // 5. Verify InResponseTo in assertion == assertion_ref
    const inResponseTo = getInResponseToFromAssertion(assertion);
    if (!inResponseTo) {
      return err(
        new UnauthorizedError("Lollipop: InResponseTo not found in assertion"),
      );
    }
    if (inResponseTo !== user.assertion_ref) {
      return err(
        new UnauthorizedError(
          `Lollipop: InResponseTo (${inResponseTo}) !== assertion_ref (${user.assertion_ref})`,
        ),
      );
    }

    // 6. Verify fiscal code in assertion == FIMS fiscal_code
    const assertionFiscalCode = getFiscalCodeFromAssertion(assertion);
    if (!assertionFiscalCode) {
      return err(
        new UnauthorizedError("Lollipop: fiscal code not found in assertion"),
      );
    }
    if (assertionFiscalCode !== user.fiscal_code) {
      return err(
        new UnauthorizedError(
          `Lollipop: fiscal code mismatch (assertion: ${assertionFiscalCode}, fims: ${user.fiscal_code})`,
        ),
      );
    }

    // 7. Verify IssueInstant is within 1 year
    const issueInstant = getIssueInstantFromAssertion(assertion);
    if (!issueInstant) {
      return err(
        new UnauthorizedError("Lollipop: IssueInstant not found in assertion"),
      );
    }
    const oneYearAfterIssue = new Date(issueInstant);
    oneYearAfterIssue.setFullYear(oneYearAfterIssue.getFullYear() + 1);
    if (oneYearAfterIssue < new Date()) {
      return err(
        new UnauthorizedError(
          "Lollipop: assertion has expired (IssueInstant older than 1 year)",
        ),
      );
    }

    // 8. Verify HTTP message signatures
    const httpSigResult = await verifyHttpSignature(
      user.assertion_ref,
      headers,
      fimsRedirectUrl,
      publicKey,
    );
    if (httpSigResult.isErr()) return err(httpSigResult.error);

    // 9. Verify state == nonce in signature-input
    const stateResult = verifyStateInSignature(
      headers["signature-input"],
      state,
    );
    if (stateResult.isErr()) return err(stateResult.error);

    return ok(true);
  },
});

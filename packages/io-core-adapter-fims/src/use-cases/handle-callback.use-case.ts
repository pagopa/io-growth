import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { err } from "neverthrow";

import type { AuditLogger, FimsSessionStore } from "../domain/ports.js";
import type {
  FimsAuthFlowConfig,
  FimsSession,
  LollipopHeaders,
} from "../domain/types.js";
import type { OidcClient } from "../oidc/oidc-client.js";

import { verifyLollipop } from "../lollipop/lollipop.js";
import { buildSessionAndRedirect } from "./session.helpers.js";
import { isTestUser } from "./test-users.js";

const DEFAULT_SESSION_TTL = 1800;
const DEFAULT_OTP_TTL = 60;

export type HandleCallback = UseCase<
  {
    code: string;
    iss: string;
    lollipopHeaders?: LollipopHeaders;
    state: string;
  },
  string,
  BaseError
>;

export const createHandleCallback = (
  oidcClient: OidcClient,
  sessionStore: FimsSessionStore,
  auditLogger: AuditLogger,
  config: FimsAuthFlowConfig,
): HandleCallback => {
  const sessionTtl = config.sessionTtlSeconds ?? DEFAULT_SESSION_TTL;
  const otpTtl = config.otpTtlSeconds ?? DEFAULT_OTP_TTL;

  return async ({ code, iss, lollipopHeaders, state }) => {
    // Validate issuer before OIDC exchange
    if (iss !== config.issuerUrl) {
      return err(new UnauthorizedError(`Invalid issuer: ${iss}`));
    }

    // Retrieve and immediately delete the one-time nonce
    const nonceResult = await sessionStore.getTemporary(`nonce:${state}`);
    if (nonceResult.isErr()) return err(nonceResult.error);
    if (!nonceResult.value) {
      return err(
        new UnauthorizedError("Nonce not found — session may have expired"),
      );
    }
    const nonce = nonceResult.value;
    await sessionStore.deleteTemporary(`nonce:${state}`);

    // Exchange OIDC code for FIMS user data
    const userResult = await oidcClient.exchangeCode(code, state, nonce, iss);
    if (userResult.isErr()) return err(userResult.error);
    const user = userResult.value;

    // Audit: FIMS code exchange — failure is blocking (compliance requirement)
    const exchangeAuditResult = await auditLogger.logFimsExchange({
      authCode: code,
      fiscalCode: user.fiscal_code,
    });
    if (exchangeAuditResult.isErr()) return err(exchangeAuditResult.error);

    // Lollipop checks — skipped for test users
    if (!isTestUser(config.testUsers, user.fiscal_code)) {
      if (!lollipopHeaders) {
        return err(
          new UnauthorizedError(
            "Lollipop headers (signature, signature-input) are required",
          ),
        );
      }
      const lollipopResult = await verifyLollipop(
        user,
        lollipopHeaders,
        state,
        config.fimsRedirectUrl,
        config.idpKeysBaseUrl,
      );
      if (lollipopResult.isErr()) return err(lollipopResult.error);

      // Audit: lollipop verification — failure is blocking
      const lollipopAuditResult = await auditLogger.logLollipopVerification({
        assertion: user.assertion,
        assertionRef: user.assertion_ref,
        fiscalCode: user.fiscal_code,
        publicKey: user.public_key,
      });
      if (lollipopAuditResult.isErr()) return err(lollipopAuditResult.error);
    }

    const session: FimsSession = {
      familyName: user.family_name,
      fiscalCode: user.fiscal_code,
      givenName: user.given_name,
    };

    return buildSessionAndRedirect(
      session,
      state,
      sessionStore,
      config,
      sessionTtl,
      otpTtl,
    );
  };
};

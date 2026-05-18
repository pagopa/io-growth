import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ForbiddenError } from "@pagopa/io-core-domain/errors";
import { err } from "neverthrow";

import type { FimsAuthFlowConfig, FimsSession } from "../../domain/entities.js";
import type { AuditLogger } from "../../domain/ports/outbound/audit-logger.repository.js";
import type { FimsSessionStore } from "../../domain/ports/outbound/session.repository.js";

import { buildSessionAndRedirect, randomHex } from "./session.helpers.js";
import { isTestUser } from "./test-users.js";

const DEFAULT_SESSION_TTL = 1800;
const DEFAULT_OTP_TTL = 60;

export type CreateTestSession = UseCase<
  { familyName: string; fiscalCode: string; givenName: string },
  string,
  BaseError
>;

export const createTestSession = (
  sessionStore: FimsSessionStore,
  auditLogger: AuditLogger,
  config: FimsAuthFlowConfig,
): CreateTestSession => {
  const sessionTtl = config.sessionTtlSeconds ?? DEFAULT_SESSION_TTL;
  const otpTtl = config.otpTtlSeconds ?? DEFAULT_OTP_TTL;

  return async ({ familyName, fiscalCode, givenName }) => {
    if (!isTestUser(config.testUsers, fiscalCode)) {
      return err(new ForbiddenError());
    }

    // Audit: test session creation — failure is blocking (compliance requirement)
    const auditResult = await auditLogger.logTestSession({ fiscalCode });
    if (auditResult.isErr()) return err(auditResult.error);

    const session: FimsSession = {
      familyName,
      fiscalCode: fiscalCode.toUpperCase(),
      givenName,
    };
    const state = randomHex();
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

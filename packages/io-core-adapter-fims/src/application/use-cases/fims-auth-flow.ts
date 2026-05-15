import type { FimsAuthFlowConfig } from "../../domain/entities.js";
import type { AuditLogger } from "../../domain/ports/outbound/audit-logger.repository.js";
import type { LollipopVerifier } from "../../domain/ports/outbound/lollipop-verifier.repository.js";
import type { OidcClient } from "../../domain/ports/outbound/oidc-client.repository.js";
import type { FimsSessionStore } from "../../domain/ports/outbound/session.repository.js";
import type { CreateTestSession } from "./create-test-session.use-case.js";
import type { ExchangeSessionId } from "./exchange-session-id.use-case.js";
import type { HandleCallback } from "./handle-callback.use-case.js";
import type { InitiateAuth } from "./initiate-auth.use-case.js";

import { createTestSession } from "./create-test-session.use-case.js";
import { createExchangeSessionId } from "./exchange-session-id.use-case.js";
import { createHandleCallback } from "./handle-callback.use-case.js";
import { createInitiateAuth } from "./initiate-auth.use-case.js";

export interface FimsAuthFlow {
  readonly createTestSession: CreateTestSession;
  readonly exchangeSessionId: ExchangeSessionId;
  readonly handleCallback: HandleCallback;
  readonly initiateAuth: InitiateAuth;
}

export const createFimsAuthFlow = (
  oidcClient: OidcClient,
  sessionStore: FimsSessionStore,
  auditLogger: AuditLogger,
  lollipopVerifier: LollipopVerifier,
  config: FimsAuthFlowConfig,
): FimsAuthFlow => ({
  createTestSession: createTestSession(sessionStore, auditLogger, config),
  exchangeSessionId: createExchangeSessionId(sessionStore),
  handleCallback: createHandleCallback(
    oidcClient,
    sessionStore,
    auditLogger,
    lollipopVerifier,
    config,
  ),
  initiateAuth: createInitiateAuth(oidcClient, sessionStore, config),
});

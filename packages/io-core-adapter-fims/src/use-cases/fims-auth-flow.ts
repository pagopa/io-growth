import type { AuditLogger, FimsSessionStore } from "../domain/ports.js";
import type { FimsAuthFlowConfig } from "../domain/types.js";
import type { OidcClient } from "../oidc/oidc-client.js";
import type { CreateTestSession } from "./create-test-session.use-case.js";
import type { ExchangeSessionId } from "./exchange-session-id.use-case.js";
import type { HandleCallback } from "./handle-callback.use-case.js";
import type { InitiateAuth } from "./initiate-auth.use-case.js";

import { createCreateTestSession } from "./create-test-session.use-case.js";
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
  config: FimsAuthFlowConfig,
): FimsAuthFlow => ({
  createTestSession: createCreateTestSession(sessionStore, config),
  exchangeSessionId: createExchangeSessionId(sessionStore),
  handleCallback: createHandleCallback(
    oidcClient,
    sessionStore,
    auditLogger,
    config,
  ),
  initiateAuth: createInitiateAuth(oidcClient, sessionStore, config),
});

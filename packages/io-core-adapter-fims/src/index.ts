// Inbound adapter — Fastify route mount
export { mountFimsHandlers } from "./adapters/inbound/fastify/fims.handler.js";

// Outbound adapters
export { createBlobAuditLogger } from "./adapters/outbound/blob/blob-audit-logger.js";
export { createLollipopVerifier } from "./adapters/outbound/lollipop/lollipop.js";
export { createOidcClient } from "./adapters/outbound/oidc/oidc-client.js";

// Application — auth flow factory
export { createFimsAuthFlow } from "./application/use-cases/fims-auth-flow.js";
export type { FimsAuthFlow } from "./application/use-cases/fims-auth-flow.js";

// Utilities
export {
  hashFiscalCode,
  isTestUser,
} from "./application/use-cases/test-users.js";
// Shared config schema and builder
export { buildFimsConfig, fimsConfigSchema } from "./config.js";
export type { FimsConfig, FimsEnvConfig } from "./config.js";
// Domain entities
export type {
  FimsAuthFlowConfig,
  FimsExchangeAudit,
  FimsSession,
  FimsUser,
  LollipopAudit,
  LollipopHeaders,
  OidcConfig,
} from "./domain/entities.js";

// Port interfaces
export type { AuditLogger } from "./domain/ports/outbound/audit-logger.repository.js";

export type { LollipopVerifier } from "./domain/ports/outbound/lollipop-verifier.repository.js";
export type { OidcClient } from "./domain/ports/outbound/oidc-client.repository.js";

export type { FimsSessionStore } from "./domain/ports/outbound/session.repository.js";

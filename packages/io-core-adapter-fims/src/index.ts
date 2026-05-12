// Fastify application factory
export { createFimsApp } from "./app/fastify-app.js";

// Audit logger
export { createBlobAuditLogger } from "./audit/blob-audit-logger.js";

// Shared config schema and builder
export { buildFimsConfig, fimsConfigSchema } from "./config.js";
export type { FimsConfig, FimsEnvConfig } from "./config.js";

// Port interfaces
export type { AuditLogger, FimsSessionStore } from "./domain/ports.js";
// Domain types
export type {
  FimsAuthFlowConfig,
  FimsExchangeAudit,
  FimsSession,
  FimsUser,
  LollipopAudit,
  LollipopHeaders,
  OidcConfig,
} from "./domain/types.js";
// OIDC client
export { createOidcClient } from "./oidc/oidc-client.js";

export type { OidcClient } from "./oidc/oidc-client.js";
// Auth flow
export { createFimsAuthFlow } from "./use-cases/fims-auth-flow.js";

export type { FimsAuthFlow } from "./use-cases/fims-auth-flow.js";

export { hashFiscalCode, isTestUser } from "./use-cases/test-users.js";

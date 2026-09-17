// Adapter factories
export { createEmailClient } from "./adapters/outbound/email.js";
export { createHealthClient } from "./adapters/outbound/health.js";

// Client bundle factory
export { createOneMailClient, type OneMailClient } from "./client.js";

// Configuration
export {
  buildOneMailConfig,
  type OneMailConfig,
  oneMailConfigSchema,
  type OneMailEnvConfig,
  type OneMailErrorEvent,
  type OneMailSentEvent,
} from "./config.js";

// Port interfaces
export type {
  EmailRepository,
  SendEmailOptions,
} from "./domain/ports/outbound/email.repository.js";

export type { HealthRepository } from "./domain/ports/outbound/health.repository.js";

// Bound fetch factory — useful for tests / advanced composition
export { createCustomFetch, type CustomFetch } from "./fetch.js";
// Generated model types — needed by the app layer to build requests and
// interpret OneMail responses.
export * from "./generated/model/index.js";

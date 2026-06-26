// Client bundle factory
export { type ArClient, createArClient } from "./ar-client.js";

// Configuration
export {
  type ArClientConfig,
  arConfigSchema,
  buildArConfig,
  buildArTestConfig,
} from "./config.js";
// Port interfaces
export type { DocumentContentRepository } from "./domain/ports/outbound/document-content.repository.js";
export type { InstitutionRepository } from "./domain/ports/outbound/institution.repository.js";

export type { OnboardingRepository } from "./domain/ports/outbound/onboarding.repository.js";
export type { UserRepository } from "./domain/ports/outbound/user.repository.js";

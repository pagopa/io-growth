// Adapter factory functions
export { createDocumentContentClient } from "./adapters/outbound/document-content.js";
export { createInstitutionClient } from "./adapters/outbound/institution.js";
export { createOnboardingClient } from "./adapters/outbound/onboarding.js";
export { createUserClient } from "./adapters/outbound/user.js";

// Client initialisation
export { initArClient } from "./client.js";

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

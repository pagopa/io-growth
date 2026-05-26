// Adapter factory functions
export { createDocumentContentClient } from "./adapters/outbound/document-content.js";
export { createInstitutionClient } from "./adapters/outbound/institution.js";
export { createOnboardingClient } from "./adapters/outbound/onboarding.js";

// Port interfaces
export type { DocumentContentRepository } from "./domain/ports/outbound/document-content.repository.js";
export type { InstitutionRepository } from "./domain/ports/outbound/institution.repository.js";
export type { OnboardingRepository } from "./domain/ports/outbound/onboarding.repository.js";

// Configuration
export type { ArClientConfig } from "./fetcher.js";

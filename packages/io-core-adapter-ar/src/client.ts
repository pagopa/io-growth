import type { ArClientConfig } from "./config.js";
import type { DocumentContentRepository } from "./domain/ports/outbound/document-content.repository.js";
import type { InstitutionRepository } from "./domain/ports/outbound/institution.repository.js";
import type { OnboardingRepository } from "./domain/ports/outbound/onboarding.repository.js";
import type { UserRepository } from "./domain/ports/outbound/user.repository.js";

import { createDocumentContentClient } from "./adapters/outbound/document-content.js";
import { createInstitutionClient } from "./adapters/outbound/institution.js";
import { createOnboardingClient } from "./adapters/outbound/onboarding.js";
import { createUserClient } from "./adapters/outbound/user.js";
import { createCustomFetch } from "./fetch.js";

/**
 * Bundle of the AR (Area Riservata) outbound clients, all bound to a single
 * {@link ArClientConfig}. A whole bundle can be routed as one unit (e.g. via an
 * environment router) without leaking the per-endpoint configuration.
 */
export interface ArClient {
  readonly documentContentClient: DocumentContentRepository;
  readonly institutionClient: InstitutionRepository;
  readonly onboardingClient: OnboardingRepository;
  readonly userClient: UserRepository;
}

export const createArClient = (config: ArClientConfig): ArClient => {
  const customFetch = createCustomFetch(config);
  return {
    documentContentClient: createDocumentContentClient(customFetch),
    institutionClient: createInstitutionClient(customFetch),
    onboardingClient: createOnboardingClient(customFetch),
    userClient: createUserClient(customFetch),
  };
};

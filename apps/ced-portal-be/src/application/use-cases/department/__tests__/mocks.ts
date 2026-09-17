import { vi } from "vitest";

import type { OnboardingDetail } from "../../../../domain/entities/onboarding.js";
import type { OnboardingRepository } from "../../../../domain/ports/outbound/onboarding.repository.js";

import { ONBOARDING_STATUS } from "../../../../domain/entities/onboarding.js";

export const MOCK_ONBOARDING_ID = "3174aaaa-0000-4000-8000-000000000001";
export const MOCK_INSTITUTION_ID = "3174bbbb-0000-4000-8000-000000000002";
export const MOCK_REFERENT_EXTERNAL_ID = "uid_3174";

export const mockOnboardingDetail = (
  overrides?: Partial<OnboardingDetail>,
): OnboardingDetail => ({
  id: MOCK_ONBOARDING_ID,
  institution: { id: MOCK_INSTITUTION_ID },
  status: ONBOARDING_STATUS.PENDING_IN_REVIEW,
  ...overrides,
});

export const createMockOnboardingRepository = (
  overrides?: Partial<OnboardingRepository>,
): OnboardingRepository => ({
  completeOnboarding: vi.fn(),
  getById: vi.fn(),
  getContractSigned: vi.fn(),
  listByProduct: vi.fn(),
  rejectOnboarding: vi.fn(),
  ...overrides,
});

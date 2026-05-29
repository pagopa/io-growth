import type {
  GenericError,
  NotFoundError,
} from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  Onboarding,
  OnboardingStatus,
  PaginatedOnboardings,
} from "../../entities/onboarding.js";

export interface ArOnboardingRepository {
  readonly completeOnboarding: (
    input: CompleteOnboardingInput,
  ) => Promise<Result<void, GenericError>>;

  readonly getById: (
    onboardingId: string,
  ) => Promise<Result<Onboarding, GenericError | NotFoundError>>;

  readonly getContractSigned: (
    onboardingId: string,
  ) => Promise<Result<Blob, GenericError>>;

  readonly listByProduct: (
    input: ListOnboardingsInput,
  ) => Promise<Result<PaginatedOnboardings, GenericError>>;
}

export interface CompleteOnboardingInput {
  readonly contract: Blob;
  readonly onboardingId: string;
}

export interface ListOnboardingsInput {
  readonly name?: string;
  readonly page: number;
  readonly productId: string;
  readonly size: number;
  readonly status?: OnboardingStatus;
}

import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  CompleteOnboardingUsingPUTBody,
  GetOnboardingWithFilterParams,
  OnboardingGetResponse,
} from "../../../generated/model/index.js";

export interface OnboardingRepository {
  readonly completeOnboarding: (
    onboardingId: string,
    body?: CompleteOnboardingUsingPUTBody,
  ) => Promise<Result<void, GenericError>>;

  readonly getOnboardingWithFilter: (
    params?: GetOnboardingWithFilterParams,
  ) => Promise<Result<OnboardingGetResponse, GenericError>>;
}

import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  CompleteOnboardingUsingPUTBody,
  GetOnboardingWithFilterParams,
  OnboardingGetResponse,
  ReasonRequest,
} from "../../../generated/model/index.js";

export interface OnboardingRepository {
  readonly completeOnboarding: (
    onboardingId: string,
    body?: CompleteOnboardingUsingPUTBody,
  ) => Promise<Result<void, GenericError>>;

  readonly getOnboardingWithFilter: (
    params?: GetOnboardingWithFilterParams,
  ) => Promise<Result<OnboardingGetResponse, GenericError>>;

  /**
   * Rejects an onboarding request, recording the reason upstream. Allowed only
   * on requests that are not COMPLETED.
   */
  readonly rejectOnboarding: (
    onboardingId: string,
    body?: ReasonRequest,
  ) => Promise<Result<void, GenericError>>;
}

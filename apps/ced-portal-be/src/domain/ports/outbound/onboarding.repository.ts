import type {
  GenericError,
  NotFoundError,
} from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  OnboardingDetail,
  OnboardingStatus,
  PaginatedOnboardings,
} from "../../entities/onboarding.js";

export interface CompleteOnboardingInput {
  readonly contract: Blob;
  readonly onboardingId: string;
}

export interface ListOnboardingsInput {
  readonly name?: string;
  readonly page: number;
  readonly productId: string;
  readonly size: number;
  readonly statuses?: OnboardingStatus[];
}

export interface OnboardingRepository {
  readonly completeOnboarding: (
    input: CompleteOnboardingInput,
  ) => Promise<Result<void, GenericError>>;

  /**
   * Propagates the contract revocation to Area Riservata. The deletion is
   * applied asynchronously upstream, so a successful call does not guarantee
   * the institution is already blocked.
   */
  readonly deleteOnboarding: (
    onboardingId: string,
  ) => Promise<Result<void, GenericError>>;

  readonly getById: (
    onboardingId: string,
  ) => Promise<Result<OnboardingDetail, GenericError | NotFoundError>>;

  readonly getContractSigned: (
    onboardingId: string,
  ) => Promise<Result<Blob, GenericError>>;

  readonly listByProduct: (
    input: ListOnboardingsInput,
  ) => Promise<Result<PaginatedOnboardings, GenericError>>;

  /**
   * Propagates the rejection of an onboarding request to Area Riservata, which
   * records the reason and notifies the institution. Upstream the operation is
   * allowed only on requests that are not COMPLETED.
   */
  readonly rejectOnboarding: (
    input: RejectOnboardingInput,
  ) => Promise<Result<void, GenericError>>;
}

export interface RejectOnboardingInput {
  readonly onboardingId: string;
  /** Uid of the department user disposing the rejection. Upstream `userUid`. */
  readonly referentExternalId: string;
  /** Reason given by the department. Upstream the field is `reasonForReject`. */
  readonly rejectionMessage: string;
}

import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { PreconditionFailedError } from "@pagopa/io-core-domain/errors";
import { errAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OnboardingRepository } from "../../../domain/ports/outbound/onboarding.repository.js";

import { ONBOARDING_STATUS } from "../../../domain/entities/onboarding.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminRejectOnboardingInputSchema = z.object({
  onboardingId: z.string().min(1),
  referentExternalId: z.string().min(1),
  rejectionMessage: z.string().min(1).max(4096),
});

export type AdminRejectOnboardingInput = z.infer<
  typeof AdminRejectOnboardingInputSchema
>;

export type AdminRejectOnboardingUseCase = UseCase<
  AdminRejectOnboardingInput,
  void,
  GenericError | NotFoundError | PreconditionFailedError | ValidationError
>;

export const makeAdminRejectOnboardingUseCase =
  (
    arOnboardingRepository: OnboardingRepository,
  ): AdminRejectOnboardingUseCase =>
  async (input) =>
    validateUseCaseInput(AdminRejectOnboardingInputSchema, input).andThen((v) =>
      new ResultAsync(arOnboardingRepository.getById(v.onboardingId))
        .andThen((onboarding) =>
          // Compared against the constant rather than listing the statuses that
          // are refused: `OnboardingDetail.status` is an unvalidated string, so
          // an absent or unexpected value must fall on the error branch.
          onboarding.status === ONBOARDING_STATUS.PENDING_IN_REVIEW
            ? new ResultAsync(
                arOnboardingRepository.rejectOnboarding({
                  onboardingId: v.onboardingId,
                  referentExternalId: v.referentExternalId,
                  rejectionMessage: v.rejectionMessage,
                }),
              )
            : errAsync(
                new PreconditionFailedError(
                  `Only an onboarding request in ${ONBOARDING_STATUS.PENDING_IN_REVIEW} can be rejected`,
                ),
              ),
        )
        .map(() => undefined),
    );

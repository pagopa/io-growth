import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OnboardingDetail } from "../../../domain/entities/onboarding.js";
import type { OnboardingRepository } from "../../../domain/ports/outbound/onboarding.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminGetOnboardingInputSchema = z.object({
  onboardingId: z.string().min(1),
});

export type AdminGetOnboardingInput = z.infer<
  typeof AdminGetOnboardingInputSchema
>;

export type AdminGetOnboardingUseCase = UseCase<
  AdminGetOnboardingInput,
  OnboardingDetail,
  GenericError | NotFoundError | ValidationError
>;

export const makeAdminGetOnboardingUseCase =
  (arOnboardingRepository: OnboardingRepository): AdminGetOnboardingUseCase =>
  async (input) =>
    validateUseCaseInput(AdminGetOnboardingInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          arOnboardingRepository.getById(validatedInput.onboardingId),
        ),
    );

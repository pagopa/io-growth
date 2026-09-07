import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OnboardingRepository } from "../../../domain/ports/outbound/onboarding.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminCompleteOnboardingInputSchema = z.object({
  contract: z.instanceof(Blob),
  onboardingId: z.string().min(1),
});

export type AdminCompleteOnboardingInput = z.infer<
  typeof AdminCompleteOnboardingInputSchema
>;

export type AdminCompleteOnboardingUseCase = UseCase<
  AdminCompleteOnboardingInput,
  void,
  GenericError | ValidationError
>;

export const makeAdminCompleteOnboardingUseCase =
  (
    arOnboardingRepository: OnboardingRepository,
  ): AdminCompleteOnboardingUseCase =>
  async (input) =>
    validateUseCaseInput(AdminCompleteOnboardingInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          arOnboardingRepository.completeOnboarding(validatedInput),
        ),
    );

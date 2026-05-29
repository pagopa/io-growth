import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type { ArOnboardingRepository } from "../../../domain/ports/outbound/ar-onboarding.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const CompleteOnboardingInputSchema = z.object({
  contract: z.instanceof(Blob),
  onboardingId: z.string().min(1),
});

export type CompleteOnboardingInput = z.infer<
  typeof CompleteOnboardingInputSchema
>;

export type CompleteOnboardingUseCase = UseCase<
  CompleteOnboardingInput,
  void,
  GenericError | ValidationError
>;

export const makeCompleteOnboardingUseCase =
  (arOnboardingRepository: ArOnboardingRepository): CompleteOnboardingUseCase =>
  async (input) =>
    validateUseCaseInput(CompleteOnboardingInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          arOnboardingRepository.completeOnboarding(validatedInput),
        ),
    );

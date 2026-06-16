import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OnboardingDetail } from "../../../domain/entities/onboarding.js";
import type { ArOnboardingRepository } from "../../../domain/ports/outbound/ar-onboarding.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const GetOnboardingInputSchema = z.object({
  onboardingId: z.string().min(1),
});

export type GetOnboardingInput = z.infer<typeof GetOnboardingInputSchema>;

export type GetOnboardingUseCase = UseCase<
  GetOnboardingInput,
  OnboardingDetail,
  GenericError | NotFoundError | ValidationError
>;

export const makeGetOnboardingUseCase =
  (arOnboardingRepository: ArOnboardingRepository): GetOnboardingUseCase =>
  async (input) =>
    validateUseCaseInput(GetOnboardingInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          arOnboardingRepository.getById(validatedInput.onboardingId),
        ),
    );

import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type { ArOnboardingRepository } from "../../../domain/ports/outbound/ar-onboarding.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const GetContractSignedInputSchema = z.object({
  onboardingId: z.string().min(1),
});

export type GetContractSignedInput = z.infer<
  typeof GetContractSignedInputSchema
>;

export type GetContractSignedUseCase = UseCase<
  GetContractSignedInput,
  Blob,
  GenericError | ValidationError
>;

export const makeGetContractSignedUseCase =
  (arOnboardingRepository: ArOnboardingRepository): GetContractSignedUseCase =>
  async (input) =>
    validateUseCaseInput(GetContractSignedInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          arOnboardingRepository.getContractSigned(validatedInput.onboardingId),
        ),
    );

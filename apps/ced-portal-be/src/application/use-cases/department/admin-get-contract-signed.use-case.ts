import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OnboardingRepository } from "../../../domain/ports/outbound/onboarding.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminGetContractSignedInputSchema = z.object({
  onboardingId: z.string().min(1),
});

export type AdminGetContractSignedInput = z.infer<
  typeof AdminGetContractSignedInputSchema
>;

export type AdminGetContractSignedUseCase = UseCase<
  AdminGetContractSignedInput,
  Blob,
  GenericError | ValidationError
>;

export const makeAdminGetContractSignedUseCase =
  (
    arOnboardingRepository: OnboardingRepository,
  ): AdminGetContractSignedUseCase =>
  async (input) =>
    validateUseCaseInput(AdminGetContractSignedInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          arOnboardingRepository.getContractSigned(validatedInput.onboardingId),
        ),
    );

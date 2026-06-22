import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OperatorProfileDetail } from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { LANGUAGE_VALUES } from "../../../domain/ports/outbound/persistence/place.repository.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const GetOperatorProfileInputSchema = z.object({
  language: z.enum(LANGUAGE_VALUES).default("it"),
  profileId: z.ulid(),
});

export type GetOperatorProfileInput = z.input<
  typeof GetOperatorProfileInputSchema
>;

export type GetOperatorProfileUseCase = UseCase<
  GetOperatorProfileInput,
  OperatorProfileDetail,
  GenericError | NotFoundError | ValidationError
>;

export const makeGetOperatorProfileUseCase =
  (profileRepository: ProfileRepository): GetOperatorProfileUseCase =>
  async (input) =>
    validateUseCaseInput(GetOperatorProfileInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(profileRepository.getById(validatedInput)).andThen(
          (data) =>
            data
              ? ok(data)
              : err(new NotFoundError("Profile", validatedInput.profileId)),
        ),
    );

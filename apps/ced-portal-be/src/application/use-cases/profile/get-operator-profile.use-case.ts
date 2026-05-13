import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { Profile } from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const GetOperatorProfileInputSchema = z.object({
  operatorId: z.ulid(),
});

export type GetOperatorProfileInput = z.infer<
  typeof GetOperatorProfileInputSchema
>;

export type GetOperatorProfileUseCase = UseCase<
  GetOperatorProfileInput,
  Profile,
  GenericError | NotFoundError | ValidationError
>;

export const makeGetOperatorProfileUseCase =
  (profileRepository: ProfileRepository): GetOperatorProfileUseCase =>
  async (input) =>
    validateUseCaseInput(GetOperatorProfileInputSchema, input).andThen(
      ({ operatorId }) =>
        new ResultAsync(profileRepository.getByOperatorId(operatorId)).andThen(
          (data) =>
            data ? ok(data) : err(new NotFoundError("Profile", "not found")),
        ),
    );

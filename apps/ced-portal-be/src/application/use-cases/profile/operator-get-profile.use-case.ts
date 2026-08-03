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

const OperatorGetProfileInputSchema = z.object({
  operatorId: z.ulid(),
});

export type OperatorGetProfileInput = z.infer<
  typeof OperatorGetProfileInputSchema
>;

export type OperatorGetProfileUseCase = UseCase<
  OperatorGetProfileInput,
  Profile,
  GenericError | NotFoundError | ValidationError
>;

export const makeOperatorGetProfileUseCase =
  (profileRepository: ProfileRepository): OperatorGetProfileUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorGetProfileInputSchema, input).andThen(
      ({ operatorId }) =>
        new ResultAsync(profileRepository.getByOperatorId(operatorId)).andThen(
          (data) =>
            data ? ok(data) : err(new NotFoundError("Profile", "not found")),
        ),
    );

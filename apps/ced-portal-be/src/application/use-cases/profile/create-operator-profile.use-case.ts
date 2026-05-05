import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { ConflictError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ResultAsync } from "neverthrow";

import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import {
  type CreateProfileInput,
  CreateProfileInputSchema,
} from "../../../domain/entities/profile.js";

export type CreateOperatorProfileUseCase = UseCase<
  CreateProfileInput,
  void,
  ConflictError | GenericError | ValidationError
>;

export const makeCreateOperatorProfileUseCase =
  (profileRepository: ProfileRepository): CreateOperatorProfileUseCase =>
  async (input) => {
    const parsed = CreateProfileInputSchema.safeParse(input);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.message));
    }

    const validatedInput = parsed.data;

    return new ResultAsync(
      profileRepository.getByOperatorId(validatedInput.operatorId),
    ).andThen((existing) =>
      existing
        ? err(new ConflictError("Operator profile already exists"))
        : new ResultAsync(profileRepository.create(validatedInput)),
    );
  };

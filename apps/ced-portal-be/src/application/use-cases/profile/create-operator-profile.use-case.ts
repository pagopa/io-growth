import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { ConflictError } from "@pagopa/io-core-domain/errors";
import { err, ResultAsync } from "neverthrow";

import type { CreateProfileInput } from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

export type CreateOperatorProfileUseCase = UseCase<
  CreateProfileInput,
  void,
  ConflictError | GenericError
>;

export const makeCreateOperatorProfileUseCase =
  (profileRepository: ProfileRepository): CreateOperatorProfileUseCase =>
  async (input) =>
    new ResultAsync(
      profileRepository.getByOperatorId(input.operatorId),
    ).andThen((existing) =>
      existing
        ? err(new ConflictError("Operator profile already exists"))
        : new ResultAsync(profileRepository.create(input)),
    );

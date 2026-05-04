import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";

import type { Profile } from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

export interface GetOperatorProfileInput {
  readonly operatorId: string;
}

export type GetOperatorProfileUseCase = UseCase<
  GetOperatorProfileInput,
  Profile,
  GenericError | NotFoundError
>;

export const makeGetOperatorProfileUseCase =
  (profileRepository: ProfileRepository): GetOperatorProfileUseCase =>
  async (input) =>
    new ResultAsync(
      profileRepository.getByOperatorId(input.operatorId),
    ).andThen((data) =>
      data ? ok(data) : err(new NotFoundError("Profile", "not found")),
    );

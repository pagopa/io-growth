import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { NotFoundError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { Profile } from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

const GetOperatorProfileInputSchema = z.object({
  operatorId: z.uuid(),
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
  async (input) => {
    const parsed = GetOperatorProfileInputSchema.safeParse(input);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.message));
    }

    return new ResultAsync(
      profileRepository.getByOperatorId(parsed.data.operatorId),
    ).andThen((data) =>
      data ? ok(data) : err(new NotFoundError("Profile", "not found")),
    );
  };

import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ConflictError } from "@pagopa/io-core-domain/errors";
import { err, ResultAsync } from "neverthrow";
import { ulid } from "ulid";
import { z } from "zod";

import type { Profile } from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";
import type { ProfileAssetsRepository } from "../../../domain/ports/outbound/profile-assets.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import { OperatorCreateProfileInputSchema } from "./utils/profile-input.schemas.js";
import { validateProfileAssets } from "./utils/validate-profile-assets.js";

export type OperatorCreateProfileInput = z.infer<
  typeof OperatorCreateProfileInputSchema
>;

export type OperatorCreateProfileUseCase = UseCase<
  OperatorCreateProfileInput,
  Profile,
  ConflictError | GenericError | ValidationError
>;

export const makeOperatorCreateProfileUseCase =
  (
    profileRepository: ProfileRepository,
    profileAssetsRepository: ProfileAssetsRepository,
  ): OperatorCreateProfileUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorCreateProfileInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          profileRepository.getByOperatorId(validatedInput.operatorId),
        ).andThen((existing) => {
          if (existing) {
            return err(new ConflictError("Operator profile already exists"));
          }

          return new ResultAsync(
            validateProfileAssets({
              image: validatedInput.image,
              logo: validatedInput.logo,
            }),
          ).andThen((validatedAssets) => {
            const profile = {
              contactEmail: validatedInput.contactEmail,
              displayName: validatedInput.displayName,
              operatorId: validatedInput.operatorId,
              place: {
                ...validatedInput.place,
                id: ulid(),
                supportContacts: validatedInput.place.supportContacts.map(
                  (sc) => ({
                    ...sc,
                    id: ulid(),
                  }),
                ),
              },
            };

            return new ResultAsync(
              profileAssetsRepository.storeProfileAssets({
                ...validatedAssets,
                operatorId: validatedInput.operatorId,
              }),
            ).andThen(() => new ResultAsync(profileRepository.create(profile)));
          });
        }),
    );

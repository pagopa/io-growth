import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { ulid } from "ulid";
import { z } from "zod";

import type { Profile } from "../../../domain/entities/profile.js";
import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";
import type { ProfileAssetsRepository } from "../../../domain/ports/outbound/profile-assets.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import { OperatorUpdateProfileInputSchema } from "./utils/profile-input.schemas.js";
import { validateOptionalProfileAssets } from "./utils/validate-profile-assets.js";

export type OperatorUpdateProfileInput = z.infer<
  typeof OperatorUpdateProfileInputSchema
>;

export type OperatorUpdateProfileUseCase = UseCase<
  OperatorUpdateProfileInput,
  Profile,
  GenericError | NotFoundError | ValidationError
>;

const makeUpdatedProfile = (
  current: Profile,
  input: OperatorUpdateProfileInput,
): Profile => {
  const usedContactIds = new Set<string>();

  return {
    contactEmail: input.contactEmail,
    displayName: input.displayName,
    operatorId: input.operatorId,
    place: {
      ...input.place,
      id: current.place.id,
      supportContacts: input.place.supportContacts.map((contact) => {
        const existing = current.place.supportContacts.find(
          (currentContact) =>
            !usedContactIds.has(currentContact.id) &&
            currentContact.type === contact.type &&
            currentContact.value === contact.value,
        );

        const id = existing?.id ?? ulid();
        usedContactIds.add(id);

        return { ...contact, id };
      }),
    },
  };
};

export const makeOperatorUpdateProfileUseCase =
  (
    profileRepository: ProfileRepository,
    profileAssetsRepository: ProfileAssetsRepository,
    materializedViewRepository: MaterializedViewRepository,
  ): OperatorUpdateProfileUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorUpdateProfileInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          profileRepository.getByOperatorId(validatedInput.operatorId),
        ).andThen((currentProfile) => {
          if (!currentProfile) {
            return errAsync(new NotFoundError("Profile", "not found"));
          }

          return new ResultAsync(
            validateOptionalProfileAssets({
              image: validatedInput.image,
              logo: validatedInput.logo,
            }),
          ).andThen((validatedAssets) => {
            const assetsUpdate =
              validatedAssets.image || validatedAssets.logo
                ? new ResultAsync(
                    profileAssetsRepository.storeProfileAssets({
                      ...validatedAssets,
                      operatorId: validatedInput.operatorId,
                    }),
                  )
                : okAsync(undefined);

            return assetsUpdate.andThen(() =>
              new ResultAsync(
                profileRepository.updateByOperatorId(
                  makeUpdatedProfile(currentProfile, validatedInput),
                ),
              ).andThen((updatedProfile) => {
                if (!updatedProfile) {
                  return errAsync(new NotFoundError("Profile", "not found"));
                }

                return new ResultAsync(materializedViewRepository.refreshAll())
                  .orElse(() => okAsync(undefined))
                  .map(() => updatedProfile);
              }),
            );
          });
        }),
    );

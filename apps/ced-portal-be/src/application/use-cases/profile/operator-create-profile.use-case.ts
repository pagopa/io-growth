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

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const OperatorCreateProfileSupportContactSchema = z.object({
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1).max(2048),
});

const OperatorCreateProfileAddressSchema = z.object({
  city: z.string().min(1).max(64),
  country: z.string().min(1).max(64),
  postalCode: z.string().min(1).max(64),
  state: z.string().min(1).max(64),
  street: z.string().min(1).max(512),
});

const OperatorCreateProfileWebsiteSchema = z.object({
  url: z.url().max(2048),
});

const OperatorCreateProfilePlaceSchema = z.discriminatedUnion("type", [
  z.object({
    address: OperatorCreateProfileAddressSchema,
    name: z.string().min(1).max(512),
    supportContacts: z.array(OperatorCreateProfileSupportContactSchema),
    type: z.literal("offline"),
  }),
  z.object({
    name: z.string().min(1).max(512),
    supportContacts: z.array(OperatorCreateProfileSupportContactSchema),
    type: z.literal("online"),
    website: OperatorCreateProfileWebsiteSchema,
  }),
]);

const OperatorCreateProfileInputSchema = z.object({
  displayName: z.string().min(1).max(512),
  operatorId: z.ulid(),
  place: OperatorCreateProfilePlaceSchema,
});

export type OperatorCreateProfileInput = z.infer<
  typeof OperatorCreateProfileInputSchema
>;

export type OperatorCreateProfileUseCase = UseCase<
  OperatorCreateProfileInput,
  Profile,
  ConflictError | GenericError | ValidationError
>;

export const makeOperatorCreateProfileUseCase =
  (profileRepository: ProfileRepository): OperatorCreateProfileUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorCreateProfileInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          profileRepository.getByOperatorId(validatedInput.operatorId),
        ).andThen((existing) => {
          if (existing) {
            return err(new ConflictError("Operator profile already exists"));
          }

          const profile = {
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

          return new ResultAsync(profileRepository.create(profile));
        }),
    );

import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ConflictError } from "@pagopa/io-core-domain/errors";
import { err, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const CreateOperatorProfileSupportContactSchema = z.object({
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1),
});

const CreateOperatorProfileAddressSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  state: z.string().min(1),
  street: z.string().min(1),
});

const CreateOperatorProfileWebsiteSchema = z.object({
  url: z.url(),
});

const CreateOperatorProfilePlaceSchema = z.discriminatedUnion("type", [
  z.object({
    address: CreateOperatorProfileAddressSchema,
    name: z.string().min(1),
    supportContacts: z.array(CreateOperatorProfileSupportContactSchema),
    type: z.literal("offline"),
  }),
  z.object({
    name: z.string().min(1),
    supportContacts: z.array(CreateOperatorProfileSupportContactSchema),
    type: z.literal("online"),
    website: CreateOperatorProfileWebsiteSchema,
  }),
]);

const CreateOperatorProfileInputSchema = z.object({
  displayName: z.string().min(1),
  operatorId: z.uuid(),
  place: CreateOperatorProfilePlaceSchema,
});

export type CreateOperatorProfileInput = z.infer<
  typeof CreateOperatorProfileInputSchema
>;

export type CreateOperatorProfileUseCase = UseCase<
  CreateOperatorProfileInput,
  void,
  ConflictError | GenericError | ValidationError
>;

export const makeCreateOperatorProfileUseCase =
  (profileRepository: ProfileRepository): CreateOperatorProfileUseCase =>
  async (input) =>
    validateUseCaseInput(CreateOperatorProfileInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          profileRepository.getByOperatorId(validatedInput.operatorId),
        ).andThen((existing) =>
          existing
            ? err(new ConflictError("Operator profile already exists"))
            : new ResultAsync(profileRepository.create(validatedInput)),
        ),
    );

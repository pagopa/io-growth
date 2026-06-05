import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { ulid } from "ulid";
import { z } from "zod";

import type { Place } from "../../../domain/entities/place.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const CreateOperatorPlaceSupportContactSchema = z.object({
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1),
});

const CreateOperatorPlaceAddressSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  state: z.string().min(1),
  street: z.string().min(1),
});

const CreateOperatorPlaceWebsiteSchema = z.object({
  url: z.url(),
});

const CreateOperatorPlacePlaceSchema = z.discriminatedUnion("type", [
  z.object({
    address: CreateOperatorPlaceAddressSchema,
    name: z.string().min(1),
    supportContacts: z.array(CreateOperatorPlaceSupportContactSchema),
    type: z.literal("offline"),
  }),
  z.object({
    name: z.string().min(1),
    supportContacts: z.array(CreateOperatorPlaceSupportContactSchema),
    type: z.literal("online"),
    website: CreateOperatorPlaceWebsiteSchema,
  }),
]);

const CreateOperatorPlaceInputSchema = z.object({
  operatorId: z.ulid(),
  place: CreateOperatorPlacePlaceSchema,
});

export type CreateOperatorPlaceInput = z.infer<
  typeof CreateOperatorPlaceInputSchema
>;

export type CreateOperatorPlaceUseCase = UseCase<
  CreateOperatorPlaceInput,
  Place,
  GenericError | ValidationError
>;

export const makeCreateOperatorPlaceUseCase =
  (placeRepository: PlaceRepository): CreateOperatorPlaceUseCase =>
  async (input) =>
    validateUseCaseInput(CreateOperatorPlaceInputSchema, input).andThen(
      (validatedInput) => {
        const place = {
          ...validatedInput.place,
          id: ulid(),
          supportContacts: validatedInput.place.supportContacts.map((sc) => ({
            ...sc,
            id: ulid(),
          })),
        };

        return new ResultAsync(
          placeRepository.create({
            operatorId: validatedInput.operatorId,
            place,
          }),
        );
      },
    );

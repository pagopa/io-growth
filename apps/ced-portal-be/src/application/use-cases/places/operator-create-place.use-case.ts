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

const OperatorCreatePlaceSupportContactSchema = z.object({
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1).max(2048),
});

const OperatorCreatePlaceAddressSchema = z.object({
  city: z.string().min(1).max(64),
  country: z.string().min(1).max(64),
  postalCode: z.string().min(1).max(64),
  state: z.string().min(1).max(64),
  street: z.string().min(1).max(512),
});

const OperatorCreatePlaceWebsiteSchema = z.object({
  url: z.url().max(2048),
});

const OperatorCreatePlacePlaceSchema = z.discriminatedUnion("type", [
  z.object({
    address: OperatorCreatePlaceAddressSchema,
    name: z.string().min(1).max(512),
    supportContacts: z.array(OperatorCreatePlaceSupportContactSchema),
    type: z.literal("offline"),
  }),
  z.object({
    name: z.string().min(1).max(512),
    supportContacts: z.array(OperatorCreatePlaceSupportContactSchema),
    type: z.literal("online"),
    website: OperatorCreatePlaceWebsiteSchema,
  }),
]);

const OperatorCreatePlaceInputSchema = z.object({
  operatorId: z.ulid(),
  place: OperatorCreatePlacePlaceSchema,
});

export type OperatorCreatePlaceInput = z.infer<
  typeof OperatorCreatePlaceInputSchema
>;

export type OperatorCreatePlaceUseCase = UseCase<
  OperatorCreatePlaceInput,
  Place,
  GenericError | ValidationError
>;

export const makeOperatorCreatePlaceUseCase =
  (placeRepository: PlaceRepository): OperatorCreatePlaceUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorCreatePlaceInputSchema, input).andThen(
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

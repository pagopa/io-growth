import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ConflictError, NotFoundError } from "@pagopa/io-core-domain/errors";
import { errAsync, ResultAsync } from "neverthrow";
import { ulid } from "ulid";
import { z } from "zod";

import type { Place } from "../../../domain/entities/place.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const UpdateSupportContactSchema = z.object({
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1),
});

const UpdateAddressSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  state: z.string().min(1),
  street: z.string().min(1),
});

const UpdateWebsiteSchema = z.object({
  url: z.url(),
});

const UpdatePlaceSchema = z.discriminatedUnion("type", [
  z.object({
    address: UpdateAddressSchema,
    name: z.string().min(1),
    supportContacts: z.array(UpdateSupportContactSchema).default([]),
    type: z.literal("offline"),
  }),
  z.object({
    name: z.string().min(1),
    supportContacts: z.array(UpdateSupportContactSchema).default([]),
    type: z.literal("online"),
    website: UpdateWebsiteSchema,
  }),
]);

const UpdateInputSchema = z.object({
  operatorId: z.ulid(),
  place: UpdatePlaceSchema,
  placeId: z.ulid(),
});

export type UpdateOperatorPlaceInput = z.infer<typeof UpdateInputSchema>;

export type UpdateOperatorPlaceUseCase = UseCase<
  UpdateOperatorPlaceInput,
  void,
  ConflictError | GenericError | NotFoundError | ValidationError
>;

export const makeUpdateOperatorPlaceUseCase =
  (placeRepository: PlaceRepository): UpdateOperatorPlaceUseCase =>
  async (input) =>
    validateUseCaseInput(UpdateInputSchema, input).andThen((validatedInput) => {
      const existingPlace: Place = {
        ...validatedInput.place,
        id: validatedInput.placeId,
        supportContacts: validatedInput.place.supportContacts.map((sc) => ({
          ...sc,
          id: ulid(),
        })),
      };

      // We use existsById rather than getById to check for place existence.
      // getById intentionally returns undefined for places that have an associated
      // operator profile (by design, to hide them from the GET endpoint). Using it
      // here would short-circuit to NotFoundError before hasProfile can fire,
      // returning 404 instead of the correct 409 Conflict.
      return new ResultAsync(
        placeRepository.existsById({
          operatorId: validatedInput.operatorId,
          placeId: validatedInput.placeId,
        }),
      )
        .andThen((exists) => {
          if (!exists) return errAsync(new NotFoundError("Place", "not found"));
          return new ResultAsync(
            placeRepository.hasProfile({
              operatorId: validatedInput.operatorId,
              placeId: validatedInput.placeId,
            }),
          );
        })
        .andThen((hasProfile) => {
          if (hasProfile)
            return errAsync(
              new ConflictError(
                "Cannot update: place has an associated operator profile",
              ),
            );
          return new ResultAsync(
            placeRepository.update({
              operatorId: validatedInput.operatorId,
              place: existingPlace,
              placeId: validatedInput.placeId,
            }),
          );
        });
    });

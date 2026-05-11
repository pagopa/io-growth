import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err } from "neverthrow";
import { z } from "zod";

import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { NewPlaceSchema } from "../../../domain/entities/place.js";

const CreateOperatorPlaceInputSchema = z.object({
  operatorId: z.uuid(),
  place: NewPlaceSchema,
});

export type CreateOperatorPlaceInput = z.infer<
  typeof CreateOperatorPlaceInputSchema
>;

export type CreateOperatorPlaceUseCase = UseCase<
  CreateOperatorPlaceInput,
  void,
  GenericError | ValidationError
>;

export const makeCreateOperatorPlaceUseCase =
  (placeRepository: PlaceRepository): CreateOperatorPlaceUseCase =>
  async (input) => {
    const parsed = CreateOperatorPlaceInputSchema.safeParse(input);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.message));
    }

    return placeRepository.create(parsed.data);
  };

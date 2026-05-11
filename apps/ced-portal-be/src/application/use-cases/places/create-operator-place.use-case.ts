import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { NewPlaceSchema } from "../../../domain/entities/place.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

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
  async (input) =>
    validateUseCaseInput(CreateOperatorPlaceInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(placeRepository.create(validatedInput)),
    );

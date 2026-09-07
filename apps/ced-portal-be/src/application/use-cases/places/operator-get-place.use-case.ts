import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { Place } from "../../../domain/entities/place.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const OperatorGetPlaceInputSchema = z.object({
  operatorId: z.ulid(),
  placeId: z.ulid(),
});

export type OperatorGetPlaceInput = z.infer<typeof OperatorGetPlaceInputSchema>;

export type OperatorGetPlaceUseCase = UseCase<
  OperatorGetPlaceInput,
  Place,
  GenericError | NotFoundError | ValidationError
>;

export const makeOperatorGetPlaceUseCase =
  (placeRepository: PlaceRepository): OperatorGetPlaceUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorGetPlaceInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(placeRepository.getById(validatedInput)).andThen(
          (data) =>
            data ? ok(data) : err(new NotFoundError("Place", "not found")),
        ),
    );

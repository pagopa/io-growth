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

const GetOperatorPlaceInputSchema = z.object({
  operatorId: z.ulid(),
  placeId: z.ulid(),
});

export type GetOperatorPlaceInput = z.infer<typeof GetOperatorPlaceInputSchema>;

export type GetOperatorPlaceUseCase = UseCase<
  GetOperatorPlaceInput,
  Place,
  GenericError | NotFoundError | ValidationError
>;

export const makeGetOperatorPlaceUseCase =
  (placeRepository: PlaceRepository): GetOperatorPlaceUseCase =>
  async (input) =>
    validateUseCaseInput(GetOperatorPlaceInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(placeRepository.getById(validatedInput)).andThen(
          (data) =>
            data ? ok(data) : err(new NotFoundError("Place", "not found")),
        ),
    );

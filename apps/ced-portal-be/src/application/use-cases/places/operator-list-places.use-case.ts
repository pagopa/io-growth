import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type { Place } from "../../../domain/entities/place.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const OperatorListPlacesInputSchema = z.object({
  operatorId: z.ulid(),
});

export type OperatorListPlacesInput = z.infer<
  typeof OperatorListPlacesInputSchema
>;

export type OperatorListPlacesUseCase = UseCase<
  OperatorListPlacesInput,
  Place[],
  GenericError | ValidationError
>;

export const makeOperatorListPlacesUseCase =
  (placeRepository: PlaceRepository): OperatorListPlacesUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorListPlacesInputSchema, input).andThen(
      ({ operatorId }) =>
        new ResultAsync(placeRepository.listByOperatorId(operatorId)),
    );

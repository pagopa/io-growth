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

const ListOperatorPlacesInputSchema = z.object({
  operatorId: z.uuid(),
});

export type ListOperatorPlacesInput = z.infer<
  typeof ListOperatorPlacesInputSchema
>;

export type ListOperatorPlacesUseCase = UseCase<
  ListOperatorPlacesInput,
  Place[],
  GenericError | ValidationError
>;

export const makeListOperatorPlacesUseCase =
  (placeRepository: PlaceRepository): ListOperatorPlacesUseCase =>
  async (input) =>
    validateUseCaseInput(ListOperatorPlacesInputSchema, input).andThen(
      ({ operatorId }) =>
        new ResultAsync(placeRepository.listByOperatorId(operatorId)),
    );

import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type {
  PaginatedPlaces,
  PlaceRepository,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const OperatorListPlacesInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  operatorId: z.ulid(),
  search: z.string().optional(),
  type: z.enum(["online", "offline"]).optional(),
});

export type OperatorListPlacesInput = z.input<
  typeof OperatorListPlacesInputSchema
>;

export type OperatorListPlacesUseCase = UseCase<
  OperatorListPlacesInput,
  PaginatedPlaces,
  GenericError | ValidationError
>;

export const makeOperatorListPlacesUseCase =
  (placeRepository: PlaceRepository): OperatorListPlacesUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorListPlacesInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(placeRepository.listByOperatorId(validatedInput)),
    );

import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type {
  AccessPointSearchItem,
  PlaceRepository,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const SearchAccessPointsInputSchema = z.object({
  limit: z.number().int().positive().optional(),
  query: z.string().min(3),
});

export type SearchAccessPointsInput = z.infer<
  typeof SearchAccessPointsInputSchema
>;

export type SearchAccessPointsUseCase = UseCase<
  SearchAccessPointsInput,
  AccessPointSearchItem[],
  GenericError | ValidationError
>;

export const makeSearchAccessPointsUseCase =
  (placeRepository: PlaceRepository): SearchAccessPointsUseCase =>
  async (input) =>
    validateUseCaseInput(SearchAccessPointsInputSchema, input).andThen(
      (validated) =>
        new ResultAsync(placeRepository.findAllByFullText(validated)),
    );

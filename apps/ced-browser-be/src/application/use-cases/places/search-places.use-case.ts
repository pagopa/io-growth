import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type {
  PlaceRepository,
  PlaceSearchItem,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const SearchPlacesInputSchema = z.object({
  limit: z.number().int().positive().optional(),
  query: z.string().min(3),
});

export type SearchPlacesInput = z.infer<typeof SearchPlacesInputSchema>;

export type SearchPlacesUseCase = UseCase<
  SearchPlacesInput,
  PlaceSearchItem[],
  GenericError | ValidationError
>;

export const makeSearchPlacesUseCase =
  (placeRepository: PlaceRepository): SearchPlacesUseCase =>
  async (input) =>
    validateUseCaseInput(SearchPlacesInputSchema, input).andThen(
      (validated) =>
        new ResultAsync(placeRepository.findAllByFullText(validated)),
    );

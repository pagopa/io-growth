import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err } from "neverthrow";
import { z } from "zod";

import type { Place } from "../../../domain/entities/place.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

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
  async (input) => {
    const parsed = ListOperatorPlacesInputSchema.safeParse(input);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.message));
    }

    return placeRepository.listByOperatorId(parsed.data.operatorId);
  };

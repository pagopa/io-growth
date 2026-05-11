import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { NotFoundError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { Place } from "../../../domain/entities/place.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

const GetOperatorPlaceInputSchema = z.object({
  operatorId: z.uuid(),
  placeId: z.uuid(),
});

export type GetOperatorPlaceInput = z.infer<typeof GetOperatorPlaceInputSchema>;

export type GetOperatorPlaceUseCase = UseCase<
  GetOperatorPlaceInput,
  Place,
  GenericError | NotFoundError | ValidationError
>;

export const makeGetOperatorPlaceUseCase =
  (placeRepository: PlaceRepository): GetOperatorPlaceUseCase =>
  async (input) => {
    const parsed = GetOperatorPlaceInputSchema.safeParse(input);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.message));
    }

    return new ResultAsync(placeRepository.getById(parsed.data)).andThen(
      (data) =>
        data ? ok(data) : err(new NotFoundError("Place", "not found")),
    );
  };

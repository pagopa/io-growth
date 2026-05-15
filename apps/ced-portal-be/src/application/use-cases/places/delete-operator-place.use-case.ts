import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ConflictError, NotFoundError } from "@pagopa/io-core-domain/errors";
import { errAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const DeleteInputSchema = z.object({
  operatorId: z.ulid(),
  placeId: z.ulid(),
});

export type DeleteOperatorPlaceInput = z.infer<typeof DeleteInputSchema>;

export type DeleteOperatorPlaceUseCase = UseCase<
  DeleteOperatorPlaceInput,
  void,
  ConflictError | GenericError | NotFoundError | ValidationError
>;

export const makeDeleteOperatorPlaceUseCase =
  (placeRepository: PlaceRepository): DeleteOperatorPlaceUseCase =>
  async (input) =>
    validateUseCaseInput(DeleteInputSchema, input).andThen((validatedInput) =>
      // We use existsById rather than getById to check for place existence.
      // getById intentionally returns undefined for places that have an associated
      // operator profile (by design, to hide them from the GET endpoint). Using it
      // here would short-circuit to NotFoundError before hasProfile can fire,
      // returning 404 instead of the correct 409 Conflict.
      new ResultAsync(
        placeRepository.existsById({
          operatorId: validatedInput.operatorId,
          placeId: validatedInput.placeId,
        }),
      )
        .andThen((exists) => {
          if (!exists) return errAsync(new NotFoundError("Place", "not found"));
          return new ResultAsync(
            placeRepository.hasProfile({
              operatorId: validatedInput.operatorId,
              placeId: validatedInput.placeId,
            }),
          );
        })
        .andThen((hasProfile) => {
          if (hasProfile)
            return errAsync(
              new ConflictError(
                "Cannot delete: place has an associated operator profile",
              ),
            );
          return new ResultAsync(
            placeRepository.hasOpportunityLinks(validatedInput.placeId),
          );
        })
        .andThen((hasLinks) => {
          if (hasLinks)
            return errAsync(
              new ConflictError(
                "Cannot delete: place is linked to an opportunity and cannot be removed",
              ),
            );
          return new ResultAsync(
            placeRepository.delete({
              operatorId: validatedInput.operatorId,
              placeId: validatedInput.placeId,
            }),
          );
        }),
    );

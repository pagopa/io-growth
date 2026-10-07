import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import {
  NotFoundError,
  PreconditionFailedError,
} from "@pagopa/io-core-domain/errors";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { Opportunity } from "../../../domain/entities/opportunity.js";
import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { OPPORTUNITY_STATUS } from "../../../domain/entities/opportunity.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const OperatorDeletePlaceInputSchema = z.object({
  operatorId: z.ulid(),
  placeId: z.ulid(),
});

export type OperatorDeletePlaceInput = z.infer<
  typeof OperatorDeletePlaceInputSchema
>;

export type OperatorDeletePlaceUseCase = UseCase<
  OperatorDeletePlaceInput,
  void,
  GenericError | NotFoundError | PreconditionFailedError | ValidationError
>;

const blockingStatuses: Opportunity["status"][] = [
  OPPORTUNITY_STATUS.PUBLISHED,
  OPPORTUNITY_STATUS.SUSPENDED,
  OPPORTUNITY_STATUS.TEST_PASSED,
  OPPORTUNITY_STATUS.TEST_PENDING,
];

export const makeOperatorDeletePlaceUseCase =
  (
    placeRepository: PlaceRepository,
    materializedViewRepository: MaterializedViewRepository,
    opportunityRepository: OpportunityRepository,
  ): OperatorDeletePlaceUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorDeletePlaceInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(placeRepository.getById(validatedInput)).andThen(
          (place) => {
            if (!place)
              return errAsync(new NotFoundError("Place", "not found"));

            return new ResultAsync(
              opportunityRepository.existsWithSolePlaceByPlaceIdAndStatuses({
                placeId: validatedInput.placeId,
                statuses: blockingStatuses,
              }),
            ).andThen((isSolePlaceOfBlockingOpportunity) => {
              if (isSolePlaceOfBlockingOpportunity)
                return errAsync(
                  new PreconditionFailedError(
                    "Place is the only one of an active opportunity and cannot be deleted",
                  ),
                );

              return new ResultAsync(
                placeRepository.deleteByIdAndOperatorId(validatedInput),
              ).andThen(() =>
                new ResultAsync(materializedViewRepository.refreshAll()).orElse(
                  () => okAsync(undefined),
                ),
              );
            });
          },
        ),
    );

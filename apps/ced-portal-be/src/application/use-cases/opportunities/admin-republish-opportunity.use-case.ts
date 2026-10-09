import type { UseCase } from "@pagopa/io-core-domain";
import type {
  ConflictError,
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import {
  NotFoundError,
  PreconditionFailedError,
} from "@pagopa/io-core-domain/errors";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { OPPORTUNITY_STATUS } from "../../../domain/entities/opportunity.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminRepublishOpportunityInputSchema = z.object({
  opportunityId: z.ulid(),
});

export type AdminRepublishOpportunityInput = z.infer<
  typeof AdminRepublishOpportunityInputSchema
>;

export type AdminRepublishOpportunityUseCase = UseCase<
  AdminRepublishOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeAdminRepublishOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
  ): AdminRepublishOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(AdminRepublishOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findById({
            opportunityId: validatedInput.opportunityId,
          }),
        ).andThen((data) => {
          if (!data)
            return errAsync(new NotFoundError("Opportunity", "not found"));

          if (data.status !== OPPORTUNITY_STATUS.SUSPENDED)
            return errAsync(
              new PreconditionFailedError(
                "Opportunity must be suspended to be republished",
              ),
            );

          return new ResultAsync(
            opportunityRepository.republishById({
              opportunityId: validatedInput.opportunityId,
            }),
          ).andThen(() =>
            new ResultAsync(materializedViewRepository.refreshAll()).orElse(
              () => okAsync(undefined),
            ),
          );
        }),
    );

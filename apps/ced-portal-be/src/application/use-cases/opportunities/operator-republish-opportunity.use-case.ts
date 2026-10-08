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
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import {
  ACTOR_TYPE,
  OPPORTUNITY_STATUS,
} from "../../../domain/entities/opportunity.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";
import { buildOpportunityRepublishedMessages } from "./utils/build-opportunity-republished-messages.js";

const OperatorRepublishOpportunityInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type OperatorRepublishOpportunityInput = z.infer<
  typeof OperatorRepublishOpportunityInputSchema
>;

export type OperatorRepublishOpportunityUseCase = UseCase<
  OperatorRepublishOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeOperatorRepublishOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
    profileRepository: ProfileRepository,
  ): OperatorRepublishOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(
      OperatorRepublishOpportunityInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(
        opportunityRepository.findByIdAndOperatorId({
          operatorId: validatedInput.operatorId,
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

        if (data.suspendedBy !== ACTOR_TYPE.OPERATOR)
          return errAsync(
            new PreconditionFailedError(
              "Only the department can republish a department-suspended opportunity",
            ),
          );

        const today = new Date().toISOString().slice(0, 10);
        if (data.dateTo && data.dateTo <= today)
          return errAsync(
            new PreconditionFailedError(
              "Opportunity end date must be in the future to republish",
            ),
          );

        return buildOpportunityRepublishedMessages(
          profileRepository,
          validatedInput.operatorId,
          data,
        )
          .andThen(
            (outboxMessages) =>
              new ResultAsync(
                opportunityRepository.republishByIdAndOperatorId({
                  operatorId: validatedInput.operatorId,
                  opportunityId: validatedInput.opportunityId,
                  outboxMessages,
                }),
              ),
          )
          .andThen(() =>
            new ResultAsync(materializedViewRepository.refreshAll()).orElse(
              () => okAsync(undefined),
            ),
          );
      }),
    );

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
import { errAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import {
  ACTOR_TYPE,
  OPPORTUNITY_STATUS,
} from "../../../domain/entities/opportunity.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const OperatorRequestOpportunityRepublishInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
  republishMessage: z.string().trim().min(1).max(4096),
});

export type OperatorRequestOpportunityRepublishInput = z.infer<
  typeof OperatorRequestOpportunityRepublishInputSchema
>;

export type OperatorRequestOpportunityRepublishUseCase = UseCase<
  OperatorRequestOpportunityRepublishInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeOperatorRequestOpportunityRepublishUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): OperatorRequestOpportunityRepublishUseCase =>
  async (input) =>
    validateUseCaseInput(
      OperatorRequestOpportunityRepublishInputSchema,
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
              "Opportunity must be suspended to request its republication",
            ),
          );

        if (data.suspendedBy !== ACTOR_TYPE.DEPARTMENT)
          return errAsync(
            new PreconditionFailedError(
              "Only a department-suspended opportunity can be requested for republication",
            ),
          );

        if (data.republishMessage)
          return errAsync(
            new PreconditionFailedError(
              "A republish request is already pending on this opportunity",
            ),
          );

        return new ResultAsync(
          opportunityRepository.requestRepublishByIdAndOperatorId({
            operatorId: validatedInput.operatorId,
            opportunityId: validatedInput.opportunityId,
            republishMessage: validatedInput.republishMessage,
          }),
        );
      }),
    );

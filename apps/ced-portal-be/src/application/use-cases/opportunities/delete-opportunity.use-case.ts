import type { UseCase } from "@pagopa/io-core-domain";
import type {
  ConflictError,
  GenericError,
} from "@pagopa/io-core-domain/errors";

import {
  NotFoundError,
  PreconditionFailedError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { errAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type {
  Opportunity,
  OpportunityDetail,
} from "../../../domain/entities/opportunity.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const DeleteOpportunityInputSchema = z.object({
  deletionMessage: z.string().trim().min(1).max(4096).optional(),
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type DeleteOpportunityInput = z.infer<
  typeof DeleteOpportunityInputSchema
>;

export type DeleteOpportunityUseCase = UseCase<
  DeleteOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

// Statuses an operator is allowed to delete an opportunity from. This list is
// also passed as the expected-status guard to the repository, so it must only
// contain persisted statuses (never the derived "scheduled" display status).
const deletableStatuses: Opportunity["status"][] = [
  "draft",
  "suspended",
  "test_rejected",
];

const isDeletable = (status: OpportunityDetail["status"]): boolean =>
  deletableStatuses.some((deletable) => deletable === status);

// "scheduled" is a published opportunity with a future dateFrom: it must be
// suspended before it can be deleted, exactly like "published".
const blockedDeletionMessage = (
  status: OpportunityDetail["status"],
): string => {
  switch (status) {
    case "published":
    case "scheduled":
      return "Opportunity must be suspended before deletion";
    case "test_pending":
      return "Opportunity cannot be deleted while under review";
    default:
      return `Opportunity in status ${status} cannot be deleted`;
  }
};

export const makeDeleteOpportunityUseCase =
  (opportunityRepository: OpportunityRepository): DeleteOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(DeleteOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findByIdAndOperatorId({
            operatorId: validatedInput.operatorId,
            opportunityId: validatedInput.opportunityId,
          }),
        ).andThen((data) => {
          if (!data)
            return errAsync(new NotFoundError("Opportunity", "not found"));

          if (!isDeletable(data.status))
            return errAsync(
              new PreconditionFailedError(blockedDeletionMessage(data.status)),
            );

          // A reason is required only when deleting a suspended opportunity.
          if (data.status === "suspended" && !validatedInput.deletionMessage)
            return errAsync(
              new ValidationError(
                "A deletion reason is required to delete a suspended opportunity",
              ),
            );

          return new ResultAsync(
            opportunityRepository.deleteByIdAndOperatorId({
              deletionMessage: validatedInput.deletionMessage,
              expectedStatuses: deletableStatuses,
              operatorId: validatedInput.operatorId,
              opportunityId: validatedInput.opportunityId,
            }),
          );
        }),
    );

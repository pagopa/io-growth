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

const OperatorDeleteOpportunityInputSchema = z.object({
  deletionMessage: z.string().trim().min(1).max(4096).optional(),
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type OperatorDeleteOpportunityInput = z.infer<
  typeof OperatorDeleteOpportunityInputSchema
>;

export type OperatorDeleteOpportunityUseCase = UseCase<
  OperatorDeleteOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

// Display (post-derivation) statuses an operator is allowed to delete from.
// "scheduled" is a published opportunity whose dateFrom is still in the future
// (not yet live): it can be deleted directly. An already-effective "published"
// opportunity (dateFrom <= today) must be suspended first, so it is NOT here.
const deletableDisplayStatuses: OpportunityDetail["status"][] = [
  "draft",
  "scheduled",
  "suspended",
  "test_rejected",
];

// Persisted statuses passed as the optimistic-concurrency guard to the repo.
// "scheduled" is not a stored value (it is a "published" row with a future
// dateFrom), so the guard uses "published" instead. The use-case precondition
// above (on the derived status) is what blocks already-effective published
// opportunities from reaching the repository.
const deletablePersistedStatuses: Opportunity["status"][] = [
  "draft",
  "published",
  "suspended",
  "test_rejected",
];

const isDeletable = (status: OpportunityDetail["status"]): boolean =>
  deletableDisplayStatuses.some((deletable) => deletable === status);

// A deletion reason is required for every deletable status except "draft".
const requiresReason = (status: OpportunityDetail["status"]): boolean =>
  status !== "draft";

const blockedDeletionMessage = (
  status: OpportunityDetail["status"],
): string => {
  switch (status) {
    case "published":
      return "Opportunity must be suspended before deletion";
    case "test_pending":
      return "Opportunity cannot be deleted while under review";
    default:
      return `Opportunity in status ${status} cannot be deleted`;
  }
};

export const makeOperatorDeleteOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): OperatorDeleteOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorDeleteOpportunityInputSchema, input).andThen(
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

          if (requiresReason(data.status) && !validatedInput.deletionMessage)
            return errAsync(
              new ValidationError(
                "A deletion reason is required to delete this opportunity",
              ),
            );

          return new ResultAsync(
            opportunityRepository.deleteByIdAndOperatorId({
              deletionMessage: validatedInput.deletionMessage,
              expectedStatuses: deletablePersistedStatuses,
              operatorId: validatedInput.operatorId,
              opportunityId: validatedInput.opportunityId,
            }),
          );
        }),
    );

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

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const OperatorSuspendOpportunityInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
  // Calendar date the suspension takes effect from. Today or in the past means
  // "immediately"; a future day schedules the suspension for that day.
  suspendFrom: z.iso.date(),
  suspensionMessage: z.string().trim().min(1).max(4096),
});

export type OperatorSuspendOpportunityInput = z.infer<
  typeof OperatorSuspendOpportunityInputSchema
>;

export type OperatorSuspendOpportunityUseCase = UseCase<
  OperatorSuspendOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeOperatorSuspendOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
  ): OperatorSuspendOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorSuspendOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findByIdAndOperatorId({
            operatorId: validatedInput.operatorId,
            opportunityId: validatedInput.opportunityId,
          }),
        ).andThen((data) => {
          if (!data)
            return errAsync(new NotFoundError("Opportunity", "not found"));

          // "scheduled" is a published opportunity whose dateFrom is still in
          // the future: it is not yet live and cannot be suspended.
          if (data.status === "scheduled")
            return errAsync(
              new PreconditionFailedError(
                "Opportunity is not yet live and cannot be suspended",
              ),
            );

          // A pending scheduled suspension must be cancelled before a new
          // suspension (immediate or scheduled) can be requested. Checked
          // before the generic status guard: a pending suspension surfaces
          // as the derived "scheduled_suspension" status, which would
          // otherwise fall through with a misleading message.
          if (data.suspendFrom)
            return errAsync(
              new PreconditionFailedError(
                "A scheduled suspension is already pending for this opportunity",
              ),
            );

          if (data.status !== "published")
            return errAsync(
              new PreconditionFailedError(
                "Opportunity must be in published status to be suspended",
              ),
            );

          // A future date schedules the suspension; today or the past applies
          // it immediately (the requested date is not persisted in that case).
          const today = new Date().toISOString().slice(0, 10);
          const isScheduled = validatedInput.suspendFrom > today;

          return new ResultAsync(
            opportunityRepository.suspendByIdAndOperatorId({
              operatorId: validatedInput.operatorId,
              opportunityId: validatedInput.opportunityId,
              suspendFrom: isScheduled ? validatedInput.suspendFrom : undefined,
              suspensionMessage: validatedInput.suspensionMessage,
            }),
          ).andThen(() =>
            // Only an immediate suspension changes visibility: refresh the
            // materialized view (best-effort). A scheduled suspension leaves
            // the opportunity published until the cron applies it.
            isScheduled
              ? okAsync(undefined)
              : new ResultAsync(materializedViewRepository.refreshAll()).orElse(
                  () => okAsync(undefined),
                ),
          );
        }),
    );

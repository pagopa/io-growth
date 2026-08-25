import type { UseCase } from "@pagopa/io-core-domain";

import {
  ConflictError,
  GenericError,
  NotFoundError,
  PreconditionFailedError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminSuspendOpportunityInputSchema = z.object({
  opportunityId: z.ulid(),
  suspendFrom: z.iso.date(),
  suspensionMessage: z.string().trim().min(1).max(4096),
});

export type AdminSuspendOpportunityInput = z.infer<
  typeof AdminSuspendOpportunityInputSchema
>;

export type AdminSuspendOpportunityUseCase = UseCase<
  AdminSuspendOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeAdminSuspendOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
  ): AdminSuspendOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(AdminSuspendOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findById({
            opportunityId: validatedInput.opportunityId,
          }),
        ).andThen((data) => {
          if (!data)
            return errAsync(new NotFoundError("Opportunity", "not found"));
          if (data.status === "scheduled")
            return errAsync(
              new PreconditionFailedError(
                "Opportunity is not yet live and cannot be suspended",
              ),
            );

          // "scheduled_suspension" (pending schedule) does NOT block the department:
          // the suspension overrides it (immediate absorbs, scheduled overwrites).
          if (
            data.status !== "published" &&
            data.status !== "scheduled_suspension"
          )
            return errAsync(
              new PreconditionFailedError(
                "Opportunity must be in published status to be suspended",
              ),
            );

          const today = new Date().toISOString().slice(0, 10);
          const isScheduled = validatedInput.suspendFrom > today;

          return new ResultAsync(
            opportunityRepository.suspendById({
              opportunityId: validatedInput.opportunityId,
              suspendFrom: isScheduled ? validatedInput.suspendFrom : undefined,
              suspensionMessage: validatedInput.suspensionMessage,
            }),
          ).andThen(() =>
            isScheduled
              ? okAsync(undefined)
              : new ResultAsync(materializedViewRepository.refreshAll()).orElse(
                  () => okAsync(undefined),
                ),
          );
        }),
    );

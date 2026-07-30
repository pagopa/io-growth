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

import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const ApproveOpportunityInputSchema = z.object({
  dateFrom: z.iso.date().optional(),
  opportunityId: z.ulid(),
});

export type ApproveOpportunityInput = z.infer<
  typeof ApproveOpportunityInputSchema
>;

export type ApproveOpportunityUseCase = UseCase<
  ApproveOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeApproveOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
  ): ApproveOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(ApproveOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findById({
            opportunityId: validatedInput.opportunityId,
          }),
        ).andThen((data) => {
          if (!data)
            return errAsync(new NotFoundError("Opportunity", "not found"));
          if (data.status !== "test_pending" && data.status !== "test_rejected")
            return errAsync(
              new PreconditionFailedError(
                "Opportunity must be in test_pending or test_rejected status to be approved",
              ),
            );
          const today = new Date().toISOString().slice(0, 10);

          return new ResultAsync(
            opportunityRepository.updateStatusById({
              dateFrom: validatedInput.dateFrom,
              expectedStatuses: ["test_pending", "test_rejected"],
              opportunityId: validatedInput.opportunityId,
              status: "published",
            }),
          ).andThen(() =>
            data.dateFrom <= today
              ? new ResultAsync(materializedViewRepository.refreshAll()).orElse(
                  () => okAsync(undefined),
                )
              : okAsync(undefined),
          );
        }),
    );

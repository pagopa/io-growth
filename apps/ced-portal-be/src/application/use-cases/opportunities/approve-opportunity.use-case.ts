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

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const ApproveOpportunityInputSchema = z.object({
  dateFrom: z.iso.date().optional(),
  opportunityId: z.ulid(),
  userType: z.enum(["admin", "operator", "test_user"]),
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
  (opportunityRepository: OpportunityRepository): ApproveOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(ApproveOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.getByIdGlobal({
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
          return new ResultAsync(
            opportunityRepository.updateStatusGlobal({
              dateFrom: validatedInput.dateFrom,
              expectedStatuses: ["test_pending", "test_rejected"],
              opportunityId: validatedInput.opportunityId,
              status: "test_passed",
            }),
          );
        }),
    );

import type { UseCase } from "@pagopa/io-core-domain";

import {
  ConflictError,
  GenericError,
  NotFoundError,
  PreconditionFailedError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { errAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminRequestOpportunityChangesInputSchema = z.object({
  opportunityId: z.ulid(),
  rejectionMessage: z.string().trim().min(1).max(300),
});

export type AdminRequestOpportunityChangesInput = z.infer<
  typeof AdminRequestOpportunityChangesInputSchema
>;

export type AdminRequestOpportunityChangesUseCase = UseCase<
  AdminRequestOpportunityChangesInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeAdminRequestOpportunityChangesUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): AdminRequestOpportunityChangesUseCase =>
  async (input) =>
    validateUseCaseInput(
      AdminRequestOpportunityChangesInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(
        opportunityRepository.findById({
          opportunityId: validatedInput.opportunityId,
        }),
      ).andThen((opportunity) => {
        if (!opportunity) {
          return errAsync(new NotFoundError("Opportunity", "not found"));
        }
        if (opportunity.status !== "test_pending") {
          return errAsync(
            new PreconditionFailedError(
              "Opportunity must be in test_pending status to request changes",
            ),
          );
        }

        return new ResultAsync(
          opportunityRepository.requestChangesById({
            expectedStatus: "test_pending",
            opportunityId: validatedInput.opportunityId,
            rejectionMessage: validatedInput.rejectionMessage,
          }),
        );
      }),
    );

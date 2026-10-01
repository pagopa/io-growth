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

import { OPPORTUNITY_STATUS } from "../../../domain/entities/opportunity.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminRequestOpportunityChangesInputSchema = z.object({
  changeRequestMessage: z.string().trim().min(1).max(4096),
  opportunityId: z.ulid(),
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
      ).andThen((data) => {
        if (!data)
          return errAsync(new NotFoundError("Opportunity", "not found"));

        if (data.status !== OPPORTUNITY_STATUS.TEST_PENDING)
          return errAsync(
            new PreconditionFailedError(
              "Opportunity must be in test_pending status to request changes",
            ),
          );

        return new ResultAsync(
          opportunityRepository.requestChangesById({
            changeRequestMessage: validatedInput.changeRequestMessage,
            opportunityId: validatedInput.opportunityId,
          }),
        );
      }),
    );

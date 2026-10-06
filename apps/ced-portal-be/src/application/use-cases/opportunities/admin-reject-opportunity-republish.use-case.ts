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

const AdminRejectOpportunityRepublishInputSchema = z.object({
  opportunityId: z.ulid(),
  republishRejectionMessage: z.string().trim().min(1).max(4096),
});

export type AdminRejectOpportunityRepublishInput = z.infer<
  typeof AdminRejectOpportunityRepublishInputSchema
>;

export type AdminRejectOpportunityRepublishUseCase = UseCase<
  AdminRejectOpportunityRepublishInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeAdminRejectOpportunityRepublishUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): AdminRejectOpportunityRepublishUseCase =>
  async (input) =>
    validateUseCaseInput(
      AdminRejectOpportunityRepublishInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(
        opportunityRepository.findById({
          opportunityId: validatedInput.opportunityId,
        }),
      ).andThen((data) => {
        if (!data)
          return errAsync(new NotFoundError("Opportunity", "not found"));

        if (data.status !== OPPORTUNITY_STATUS.SUSPENDED)
          return errAsync(
            new PreconditionFailedError(
              "Opportunity must be suspended to reject its republication",
            ),
          );

        if (!data.republishMessage)
          return errAsync(
            new PreconditionFailedError(
              "No republish request is pending on this opportunity",
            ),
          );

        return new ResultAsync(
          opportunityRepository.rejectRepublishById({
            opportunityId: validatedInput.opportunityId,
            republishRejectionMessage: validatedInput.republishRejectionMessage,
          }),
        );
      }),
    );

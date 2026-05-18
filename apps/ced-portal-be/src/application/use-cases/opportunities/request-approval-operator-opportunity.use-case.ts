import type { UseCase } from "@pagopa/io-core-domain";
import type {
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

const RequestApprovalOperatorOpportunityInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type RequestApprovalOperatorOpportunityInput = z.infer<
  typeof RequestApprovalOperatorOpportunityInputSchema
>;

export type RequestApprovalOperatorOpportunityUseCase = UseCase<
  RequestApprovalOperatorOpportunityInput,
  void,
  GenericError | NotFoundError | PreconditionFailedError | ValidationError
>;

export const makeRequestApprovalOperatorOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): RequestApprovalOperatorOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(
      RequestApprovalOperatorOpportunityInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(opportunityRepository.getById(validatedInput)).andThen(
        (data) => {
          if (!data) {
            return errAsync(new NotFoundError("Opportunity", "not found"));
          }
          if (data.status !== "draft") {
            return errAsync(
              new PreconditionFailedError(
                "Opportunity must be in draft status to request approval",
              ),
            );
          }
          return new ResultAsync(
            opportunityRepository.updateStatus({
              operatorId: validatedInput.operatorId,
              opportunityId: validatedInput.opportunityId,
              status: "approval_pending",
            }),
          );
        },
      ),
    );

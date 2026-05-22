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

const RequestTestOperatorOpportunityInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type RequestTestOperatorOpportunityInput = z.infer<
  typeof RequestTestOperatorOpportunityInputSchema
>;

export type RequestTestOperatorOpportunityUseCase = UseCase<
  RequestTestOperatorOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeRequestTestOperatorOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): RequestTestOperatorOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(
      RequestTestOperatorOpportunityInputSchema,
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
                "Opportunity must be in draft status to request testing",
              ),
            );
          }
          return new ResultAsync(
            opportunityRepository.updateStatus({
              expectedStatus: "draft",
              operatorId: validatedInput.operatorId,
              opportunityId: validatedInput.opportunityId,
              status: "test_pending",
            }),
          );
        },
      ),
    );

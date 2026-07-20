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

const OperatorCancelScheduledSuspensionInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type OperatorCancelScheduledSuspensionInput = z.infer<
  typeof OperatorCancelScheduledSuspensionInputSchema
>;

export type OperatorCancelScheduledSuspensionUseCase = UseCase<
  OperatorCancelScheduledSuspensionInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeOperatorCancelScheduledSuspensionUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): OperatorCancelScheduledSuspensionUseCase =>
  async (input) =>
    validateUseCaseInput(
      OperatorCancelScheduledSuspensionInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(
        opportunityRepository.findByIdAndOperatorId({
          operatorId: validatedInput.operatorId,
          opportunityId: validatedInput.opportunityId,
        }),
      ).andThen((data) => {
        if (!data)
          return errAsync(new NotFoundError("Opportunity", "not found"));

        if (!data.suspendFrom)
          return errAsync(
            new PreconditionFailedError(
              "No scheduled suspension is pending for this opportunity",
            ),
          );

        if (data.suspendedBy !== "operator")
          return errAsync(
            new PreconditionFailedError(
              "Only the department can cancel a department-scheduled suspension",
            ),
          );

        return new ResultAsync(
          opportunityRepository.cancelScheduledSuspensionByIdAndOperatorId({
            operatorId: validatedInput.operatorId,
            opportunityId: validatedInput.opportunityId,
          }),
        );
      }),
    );

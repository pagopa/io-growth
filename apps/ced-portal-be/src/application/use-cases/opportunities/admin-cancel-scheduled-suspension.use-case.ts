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

const AdminCancelScheduledSuspensionInputSchema = z.object({
  opportunityId: z.ulid(),
});

export type AdminCancelScheduledSuspensionInput = z.infer<
  typeof AdminCancelScheduledSuspensionInputSchema
>;

export type AdminCancelScheduledSuspensionUseCase = UseCase<
  AdminCancelScheduledSuspensionInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeAdminCancelScheduledSuspensionUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): AdminCancelScheduledSuspensionUseCase =>
  async (input) =>
    validateUseCaseInput(
      AdminCancelScheduledSuspensionInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(
        opportunityRepository.findById({
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

        return new ResultAsync(
          opportunityRepository.cancelScheduledSuspensionById({
            opportunityId: validatedInput.opportunityId,
          }),
        );
      }),
    );

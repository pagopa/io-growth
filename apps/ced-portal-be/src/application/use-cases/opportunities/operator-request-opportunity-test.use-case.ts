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
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const OperatorRequestOpportunityTestInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type OperatorRequestOpportunityTestInput = z.infer<
  typeof OperatorRequestOpportunityTestInputSchema
>;

export type OperatorRequestOpportunityTestUseCase = UseCase<
  OperatorRequestOpportunityTestInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makeOperatorRequestOpportunityTestUseCase =
  (
    opportunityRepository: OpportunityRepository,
    profileRepository: ProfileRepository,
  ): OperatorRequestOpportunityTestUseCase =>
  async (input) =>
    validateUseCaseInput(
      OperatorRequestOpportunityTestInputSchema,
      input,
    ).andThen((validatedInput) =>
      new ResultAsync(
        opportunityRepository.findByIdAndOperatorId(validatedInput),
      ).andThen((data) => {
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
        if (!data.nationalTerritory && data.placeIds.length === 0) {
          return errAsync(
            new PreconditionFailedError(
              "Opportunity must have at least one place or be valid on the national territory to request testing",
            ),
          );
        }
        return new ResultAsync(
          profileRepository.getByOperatorId(validatedInput.operatorId),
        ).andThen((profile) => {
          if (!profile) {
            return errAsync(
              new PreconditionFailedError(
                "Operator must have a profile to publish an opportunity",
              ),
            );
          }
          return new ResultAsync(
            opportunityRepository.updateStatusByIdAndOperatorId({
              expectedStatus: "draft",
              operatorId: validatedInput.operatorId,
              opportunityId: validatedInput.opportunityId,
              status: "test_pending",
            }),
          );
        });
      }),
    );

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

import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const PublishOpportunityInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type PublishOpportunityInput = z.infer<
  typeof PublishOpportunityInputSchema
>;

export type PublishOpportunityUseCase = UseCase<
  PublishOpportunityInput,
  void,
  | ConflictError
  | GenericError
  | NotFoundError
  | PreconditionFailedError
  | ValidationError
>;

export const makePublishOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
    materializedViewRepository: MaterializedViewRepository,
    profileRepository: ProfileRepository,
  ): PublishOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(PublishOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findByIdAndOperatorId({
            operatorId: validatedInput.operatorId,
            opportunityId: validatedInput.opportunityId,
          }),
        ).andThen((data) => {
          if (!data)
            return errAsync(new NotFoundError("Opportunity", "not found"));
          if (data.status !== "test_passed")
            return errAsync(
              new PreconditionFailedError(
                "Opportunity must be in test_passed status to be published",
              ),
            );

          return new ResultAsync(
            profileRepository.getByOperatorId(validatedInput.operatorId),
          ).andThen((profile) => {
            if (!profile)
              return errAsync(
                new PreconditionFailedError(
                  "Operator must have a profile to publish an opportunity",
                ),
              );

            const today = new Date().toISOString().slice(0, 10);

            return new ResultAsync(
              opportunityRepository.updateStatusByIdAndOperatorId({
                expectedStatus: "test_passed",
                operatorId: validatedInput.operatorId,
                opportunityId: validatedInput.opportunityId,
                status: "published",
              }),
            ).andThen(() =>
              data.dateFrom <= today
                ? new ResultAsync(
                    materializedViewRepository.refreshAll(),
                  ).orElse(() => okAsync(undefined))
                : okAsync(undefined),
            );
          });
        }),
    );

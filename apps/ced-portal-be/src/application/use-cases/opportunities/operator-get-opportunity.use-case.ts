import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { OpportunityDetail } from "../../../domain/entities/opportunity.js";
import type { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const OperatorGetOpportunityInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type OperatorGetOpportunityInput = z.infer<
  typeof OperatorGetOpportunityInputSchema
>;

export type OperatorGetOpportunityUseCase = UseCase<
  OperatorGetOpportunityInput,
  OpportunityDetail,
  GenericError | NotFoundError | ValidationError
>;

export const makeOperatorGetOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): OperatorGetOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorGetOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findByIdAndOperatorId(validatedInput),
        ).andThen((data) =>
          data ? ok(data) : err(new NotFoundError("Opportunity", "not found")),
        ),
    );

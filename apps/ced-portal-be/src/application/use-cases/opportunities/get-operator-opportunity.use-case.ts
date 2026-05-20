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

const GetOperatorOpportunityInputSchema = z.object({
  operatorId: z.ulid(),
  opportunityId: z.ulid(),
});

export type GetOperatorOpportunityInput = z.infer<
  typeof GetOperatorOpportunityInputSchema
>;

export type GetOperatorOpportunityUseCase = UseCase<
  GetOperatorOpportunityInput,
  OpportunityDetail,
  GenericError | NotFoundError | ValidationError
>;

export const makeGetOperatorOpportunityUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): GetOperatorOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(GetOperatorOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(opportunityRepository.getById(validatedInput)).andThen(
          (data) =>
            data
              ? ok(data)
              : err(new NotFoundError("Opportunity", "not found")),
        ),
    );

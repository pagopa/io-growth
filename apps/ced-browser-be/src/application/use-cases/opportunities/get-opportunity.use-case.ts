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

import { LANGUAGE_VALUES } from "../../../domain/ports/outbound/persistence/place.repository.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const GetOpportunityInputSchema = z.object({
  language: z.enum(LANGUAGE_VALUES).default("it"),
  opportunityId: z.string().min(1),
});

export type GetOpportunityInput = z.input<typeof GetOpportunityInputSchema>;

export type GetOpportunityUseCase = UseCase<
  GetOpportunityInput,
  OpportunityDetail,
  GenericError | NotFoundError | ValidationError
>;

export const makeGetOpportunityUseCase =
  (opportunityRepository: OpportunityRepository): GetOpportunityUseCase =>
  async (input) =>
    validateUseCaseInput(GetOpportunityInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findPublishedById(validatedInput),
        ).andThen((data) =>
          data
            ? ok(data)
            : err(
                new NotFoundError("Opportunity", validatedInput.opportunityId),
              ),
        ),
    );

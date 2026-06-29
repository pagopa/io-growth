import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type {
  OpportunityRepository,
  SearchOpportunitiesResult,
} from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import {
  OPPORTUNITY_ORDER_BY_VALUES,
  OPPORTUNITY_ORDER_DIRECTION_VALUES,
} from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import { LANGUAGE_VALUES } from "../../../domain/ports/outbound/persistence/place.repository.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const SearchOpportunitiesInputSchema = z.object({
  language: z.enum(LANGUAGE_VALUES).default("it"),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
  orderBy: z.enum(OPPORTUNITY_ORDER_BY_VALUES).default("dateFrom"),
  orderDirection: z.enum(OPPORTUNITY_ORDER_DIRECTION_VALUES).default("desc"),
});

export type SearchOpportunitiesInput = z.input<
  typeof SearchOpportunitiesInputSchema
>;

export type SearchOpportunitiesUseCase = UseCase<
  SearchOpportunitiesInput,
  SearchOpportunitiesResult,
  GenericError | ValidationError
>;

export const makeSearchOpportunitiesUseCase =
  (opportunityRepository: OpportunityRepository): SearchOpportunitiesUseCase =>
  async (input) =>
    validateUseCaseInput(SearchOpportunitiesInputSchema, input).andThen(
      (validated) =>
        new ResultAsync(
          opportunityRepository.searchFromMaterializedView(validated),
        ),
    );

import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import type {
  OpportunityRepository,
  PaginatedOpportunities,
} from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const ListOperatorOpportunitiesInputSchema = z.object({
  categoryId: z.ulid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  operatorId: z.ulid(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z
    .enum([
      "draft",
      "test_pending",
      "test_rejected",
      "test_passed",
      "published",
      "scheduled",
      "suspended",
      "deleted",
    ])
    .optional(),
});

export type ListOperatorOpportunitiesInput = z.infer<
  typeof ListOperatorOpportunitiesInputSchema
>;

export type ListOperatorOpportunitiesUseCase = UseCase<
  ListOperatorOpportunitiesInput,
  PaginatedOpportunities,
  GenericError | ValidationError
>;

export const makeListOperatorOpportunitiesUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): ListOperatorOpportunitiesUseCase =>
  async (input) =>
    validateUseCaseInput(ListOperatorOpportunitiesInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findAll({
            ...validatedInput,
            // Server-owned reference date used to resolve the derived
            // "scheduled" / "published" statuses against dateFrom.
            referenceDate: new Date().toISOString().slice(0, 10),
          }),
        ),
    );

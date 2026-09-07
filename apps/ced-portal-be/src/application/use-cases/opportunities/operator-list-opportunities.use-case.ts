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

const OperatorListOpportunitiesInputSchema = z.object({
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
      "scheduled_suspension",
      "suspended",
    ])
    .optional(),
});

export type OperatorListOpportunitiesInput = z.infer<
  typeof OperatorListOpportunitiesInputSchema
>;

export type OperatorListOpportunitiesUseCase = UseCase<
  OperatorListOpportunitiesInput,
  PaginatedOpportunities,
  GenericError | ValidationError
>;

export const makeOperatorListOpportunitiesUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): OperatorListOpportunitiesUseCase =>
  async (input) =>
    validateUseCaseInput(OperatorListOpportunitiesInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findAll({
            ...validatedInput,
            excludeDeleted: true,
          }),
        ),
    );

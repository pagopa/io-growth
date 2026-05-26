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

const ListOpportunitiesInputSchema = z.object({
  categoryId: z.string().ulid().optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  operatorId: z.string().ulid().optional(),
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
      "suspended",
      "deleted",
    ])
    .optional(),
  userType: z.enum(["admin", "operator", "test_user"]),
});

export type ListOpportunitiesInput = z.infer<
  typeof ListOpportunitiesInputSchema
>;

export type ListOpportunitiesUseCase = UseCase<
  ListOpportunitiesInput,
  PaginatedOpportunities,
  GenericError | ValidationError
>;

export const makeListOpportunitiesUseCase =
  (opportunityRepository: OpportunityRepository): ListOpportunitiesUseCase =>
  async (input) =>
    validateUseCaseInput(ListOpportunitiesInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.list({
            categoryId: validatedInput.categoryId,
            dateFrom: validatedInput.dateFrom,
            dateTo: validatedInput.dateTo,
            limit: validatedInput.limit,
            offset: validatedInput.offset,
            operatorId: validatedInput.operatorId,
            search: validatedInput.search,
            sortBy: validatedInput.sortBy,
            sortOrder: validatedInput.sortOrder,
            status: validatedInput.status,
          }),
        ),
    );

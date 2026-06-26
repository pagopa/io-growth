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

import { USER_TYPES } from "../../../domain/entities/user-type.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const AdminListOpportunitiesInputSchema = z.object({
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
      "scheduled",
      "suspended",
      "deleted",
    ])
    .optional(),
  // kept for future per-userType branching
  userType: z.enum(USER_TYPES),
});

export type AdminListOpportunitiesInput = z.infer<
  typeof AdminListOpportunitiesInputSchema
>;

export type AdminListOpportunitiesUseCase = UseCase<
  AdminListOpportunitiesInput,
  PaginatedOpportunities,
  GenericError | ValidationError
>;

export const makeAdminListOpportunitiesUseCase =
  (
    opportunityRepository: OpportunityRepository,
  ): AdminListOpportunitiesUseCase =>
  async (input) =>
    validateUseCaseInput(AdminListOpportunitiesInputSchema, input).andThen(
      (validatedInput) =>
        new ResultAsync(
          opportunityRepository.findAll({
            categoryId: validatedInput.categoryId,
            dateFrom: validatedInput.dateFrom,
            dateTo: validatedInput.dateTo,
            limit: validatedInput.limit,
            offset: validatedInput.offset,
            operatorId: validatedInput.operatorId,
            // Server-owned reference date used to resolve the derived
            // "scheduled" / "published" statuses against dateFrom.
            referenceDate: new Date().toISOString().slice(0, 10),
            search: validatedInput.search,
            searchFields: ["name", "operatorName"],
            sortBy: validatedInput.sortBy,
            sortOrder: validatedInput.sortOrder,
            status: validatedInput.status,
          }),
        ),
    );

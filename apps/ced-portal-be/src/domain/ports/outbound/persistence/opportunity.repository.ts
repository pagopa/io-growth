import type {
  ConflictError,
  GenericError,
} from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  Opportunity,
  OpportunityDetail,
  OpportunitySummary,
} from "../../../entities/opportunity.js";

export interface CreateOpportunityInput {
  operatorId: string;
  opportunity: Opportunity;
}

export interface FindByIdAndOperatorIdInput {
  operatorId: string;
  opportunityId: string;
}

export interface FindByIdInput {
  opportunityId: string;
}

export interface ListOpportunitiesInput {
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
  operatorId?: string;
  // Reference date (YYYY-MM-DD) used to resolve the derived "scheduled" /
  // "published" statuses against the opportunity dateFrom.
  referenceDate?: string;
  search?: string;
  searchFields?: readonly OpportunitySearchField[];
  sortBy: "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  status?: OpportunityStatusFilter;
}

export interface OpportunityRepository {
  readonly countByExternalOperatorIds: (
    operatorIds: readonly string[],
  ) => Promise<Result<ReadonlyMap<string, number>, GenericError>>;
  readonly create: (
    input: CreateOpportunityInput,
  ) => Promise<Result<OpportunityDetail, GenericError>>;
  readonly findAll: (
    input: ListOpportunitiesInput,
  ) => Promise<Result<PaginatedOpportunities, GenericError>>;
  readonly findById: (
    input: FindByIdInput,
  ) => Promise<Result<OpportunityDetail | undefined, GenericError>>;
  readonly findByIdAndOperatorId: (
    input: FindByIdAndOperatorIdInput,
  ) => Promise<Result<OpportunityDetail | undefined, GenericError>>;
  readonly updateStatusById: (
    input: UpdateOpportunityStatusByIdInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
  readonly updateStatusByIdAndOperatorId: (
    input: UpdateOpportunityStatusByIdAndOperatorIdInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
}

export type OpportunitySearchField = "name" | "operatorName";

// "scheduled" is a request-only, derived filter value: it is not a stored
// status. It selects published opportunities whose dateFrom is still in the
// future relative to the reference date.
export type OpportunityStatusFilter =
  | "scheduled"
  | OpportunitySummary["status"];

export interface PaginatedOpportunities {
  items: OpportunitySummary[];
  total: number;
}

export interface UpdateOpportunityStatusByIdAndOperatorIdInput {
  expectedStatus?: Opportunity["status"];
  operatorId: string;
  opportunityId: string;
  status: Opportunity["status"];
}

export interface UpdateOpportunityStatusByIdInput {
  dateFrom?: string;
  expectedStatuses: OpportunitySummary["status"][];
  opportunityId: string;
  status: OpportunitySummary["status"];
}

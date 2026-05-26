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

export interface GetOpportunityByIdGlobalInput {
  opportunityId: string;
}

export interface GetOpportunityByIdInput {
  operatorId: string;
  opportunityId: string;
}

export interface ListOpportunitiesInput {
  categoryId?: string;
  limit: number;
  offset: number;
  operatorId: string;
  search?: string;
  sortBy: "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  status?: OpportunitySummary["status"];
}

export interface OpportunityRepository {
  readonly countByOperatorIds: (
    operatorIds: readonly string[],
  ) => Promise<Result<ReadonlyMap<string, number>, GenericError>>;
  readonly create: (
    input: CreateOpportunityInput,
  ) => Promise<Result<OpportunityDetail, GenericError>>;
  readonly getById: (
    input: GetOpportunityByIdInput,
  ) => Promise<Result<OpportunityDetail | undefined, GenericError>>;
  readonly getByIdGlobal: (
    input: GetOpportunityByIdGlobalInput,
  ) => Promise<Result<OpportunityDetail | undefined, GenericError>>;
  readonly list: (
    input: ListOpportunitiesInput,
  ) => Promise<Result<PaginatedOpportunities, GenericError>>;
  readonly updateStatus: (
    input: UpdateOpportunityStatusInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
  readonly updateStatusGlobal: (
    input: UpdateOpportunityStatusGlobalInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
}

export interface PaginatedOpportunities {
  items: OpportunitySummary[];
  total: number;
}

export interface UpdateOpportunityStatusGlobalInput {
  dateFrom?: string;
  expectedStatuses: OpportunitySummary["status"][];
  opportunityId: string;
  status: OpportunitySummary["status"];
}

export interface UpdateOpportunityStatusInput {
  expectedStatus?: Opportunity["status"];
  operatorId: string;
  opportunityId: string;
  status: Opportunity["status"];
}

import type { GenericError } from "@pagopa/io-core-domain/errors";
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

export interface GetOpportunityByIdInput {
  operatorId: string;
  opportunityId: string;
}

export interface ListOpportunitiesInput {
  limit: number;
  offset: number;
  operatorId: string;
  search?: string;
  sortBy: "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  status?: OpportunitySummary["status"];
}

export interface OpportunityRepository {
  readonly create: (
    input: CreateOpportunityInput,
  ) => Promise<Result<void, GenericError>>;
  readonly getById: (
    input: GetOpportunityByIdInput,
  ) => Promise<Result<OpportunityDetail | undefined, GenericError>>;
  readonly list: (
    input: ListOpportunitiesInput,
  ) => Promise<Result<PaginatedOpportunities, GenericError>>;
  readonly updateStatus: (
    input: UpdateOpportunityStatusInput,
  ) => Promise<Result<void, GenericError>>;
}

export interface PaginatedOpportunities {
  items: OpportunitySummary[];
  total: number;
}

export interface UpdateOpportunityStatusInput {
  operatorId: string;
  opportunityId: string;
  status: Opportunity["status"];
}

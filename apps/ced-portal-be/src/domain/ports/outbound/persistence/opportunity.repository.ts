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

export interface CancelScheduledSuspensionByIdAndOperatorIdInput {
  operatorId: string;
  opportunityId: string;
}

export interface CancelScheduledSuspensionByIdInput {
  opportunityId: string;
}

export interface CreateOpportunityInput {
  operatorId: string;
  opportunity: Opportunity;
}

export interface DeleteOpportunityByIdAndOperatorIdInput {
  deletionMessage?: string;
  expectedStatuses: Opportunity["status"][];
  operatorId: string;
  opportunityId: string;
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
  // When true, "deleted" opportunities are excluded regardless of the status
  // filter. Operator reads set this; department/admin reads leave it unset.
  excludeDeleted?: boolean;
  limit: number;
  offset: number;
  operatorId?: string;
  search?: string;
  searchFields?: readonly OpportunitySearchField[];
  sortBy: "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  status?: OpportunityStatusFilter;
}

export interface OpportunityRepository {
  readonly cancelScheduledSuspensionById: (
    input: CancelScheduledSuspensionByIdInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
  readonly cancelScheduledSuspensionByIdAndOperatorId: (
    input: CancelScheduledSuspensionByIdAndOperatorIdInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
  readonly countByExternalOperatorIds: (
    operatorIds: readonly string[],
  ) => Promise<Result<ReadonlyMap<string, number>, GenericError>>;
  readonly create: (
    input: CreateOpportunityInput,
  ) => Promise<Result<OpportunityDetail, GenericError>>;
  readonly deleteByIdAndOperatorId: (
    input: DeleteOpportunityByIdAndOperatorIdInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
  readonly findAll: (
    input: ListOpportunitiesInput,
  ) => Promise<Result<PaginatedOpportunities, GenericError>>;
  readonly findById: (
    input: FindByIdInput,
  ) => Promise<Result<OpportunityDetail | undefined, GenericError>>;
  readonly findByIdAndOperatorId: (
    input: FindByIdAndOperatorIdInput,
  ) => Promise<Result<OpportunityDetail | undefined, GenericError>>;
  readonly suspendById: (
    input: SuspendByIdInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
  readonly suspendByIdAndOperatorId: (
    input: SuspendByIdAndOperatorIdInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
  readonly updateStatusById: (
    input: UpdateOpportunityStatusByIdInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
  readonly updateStatusByIdAndOperatorId: (
    input: UpdateOpportunityStatusByIdAndOperatorIdInput,
  ) => Promise<Result<void, ConflictError | GenericError>>;
}

export type OpportunitySearchField = "name" | "operatorName";

// Derived filter values (not stored in DB):
// - "scheduled": published opportunities whose dateFrom is in the future.
// - "scheduled_suspension": published, live opportunities with a future suspendFrom.
export type OpportunityStatusFilter =
  | "scheduled"
  | "scheduled_suspension"
  | Opportunity["status"];
export interface PaginatedOpportunities {
  items: OpportunitySummary[];
  total: number;
}

export interface SuspendByIdAndOperatorIdInput {
  operatorId: string;
  opportunityId: string;
  // When provided (a future calendar date), the suspension is deferred: the
  // opportunity stays "published" and "suspend_from" is set. When absent, the
  // suspension is applied immediately (status -> "suspended").
  suspendFrom?: string;
  suspensionMessage: string;
}

export interface SuspendByIdInput {
  opportunityId: string;
  suspendFrom?: string;
  suspensionMessage: string;
}

export interface UpdateOpportunityStatusByIdAndOperatorIdInput {
  expectedStatus?: Opportunity["status"];
  operatorId: string;
  opportunityId: string;
  status: Opportunity["status"];
}

export interface UpdateOpportunityStatusByIdInput {
  dateFrom?: string;
  expectedStatuses: Opportunity["status"][];
  opportunityId: string;
  status: Opportunity["status"];
}

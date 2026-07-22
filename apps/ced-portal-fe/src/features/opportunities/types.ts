import { AdminOpportunitySummaryItem } from '../../core/api/generated/model';
import type { ApproveOpportunityBody } from '../../core/api/generated/model/approveOpportunityBody';
import type { ListOperatorOpportunitiesStatus } from '../../core/api/generated/model/listOperatorOpportunitiesStatus';
import type { OpportunityDetailAdminResponse } from '../../core/api/generated/model/opportunityDetailAdminResponse';
import type { OpportunityDetailResponse } from '../../core/api/generated/model/opportunityDetailResponse';
import type { OpportunityListResponse } from '../../core/api/generated/model/opportunityListResponse';
import type { OpportunitySummaryItemStatus } from '../../core/api/generated/model/opportunitySummaryItemStatus';
export { type LocalizedMetadataItem } from '../../core/api/generated/model/localizedMetadataItem';
export { OpportunitySummaryItemStatus as OpportunityStatusEnum } from '../../core/api/generated/model/opportunitySummaryItemStatus';

type ScheduledSuspensionStatus = 'scheduled_suspension';
type SuspensionActorType = 'operator' | 'department';

export type OpportunityStatus =
  | OpportunitySummaryItemStatus
  | ScheduledSuspensionStatus;

interface OpportunitySuspensionFields {
  suspendFrom?: string | null;
  suspendedByType?: SuspensionActorType | null;
  suspensionMessage?: string | null;
}

type OpportunityWithExtendedStatus<T extends { status: string }> = Omit<
  T,
  'status'
> & {
  status: OpportunityStatus;
} & OpportunitySuspensionFields;

export type OpportunityDetail = OpportunityDetailResponse;
export type OpportunitiesResponse = OpportunityListResponse;
export type Opportunity =
  OpportunityWithExtendedStatus<AdminOpportunitySummaryItem>;

export type AdminOpportunity = Opportunity;
export type AdminOpportunityDetail =
  OpportunityWithExtendedStatus<OpportunityDetailAdminResponse>;

export type AdminOpportunityStatusFilter =
  | ListOperatorOpportunitiesStatus
  | ScheduledSuspensionStatus;

export interface ListAdminOpportunitiesParams {
  offset?: number;
  limit?: number;
  status?: AdminOpportunityStatusFilter;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  operatorId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type ApproveOpportunityPayload = ApproveOpportunityBody;

export interface SuspendOpportunityPayload {
  suspensionMessage: string;
  suspendFrom: string;
}

// UI-only filter state
export interface OpportunityFilters {
  search: string;
  state: string;
}

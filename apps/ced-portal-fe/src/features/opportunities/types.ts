import type { AdminOpportunitySummaryItem } from '../../generated/model';
import type { ApproveOpportunityBody } from '../../generated/model/approveOpportunityBody';
import type { ListOperatorOpportunitiesStatus } from '../../generated/model/listOperatorOpportunitiesStatus';
import type { OpportunityDetailAdminResponse } from '../../generated/model/opportunityDetailAdminResponse';
import type { OpportunityDetailResponse } from '../../generated/model/opportunityDetailResponse';
import type { OpportunityListResponse } from '../../generated/model/opportunityListResponse';
import type { OpportunitySummaryItem } from '../../generated/model/opportunitySummaryItem';
export { type LocalizedMetadataItem } from '../../generated/model/localizedMetadataItem';
export { OpportunitySummaryItemStatus as OpportunityStatusEnum } from '../../generated/model/opportunitySummaryItemStatus';

interface OpportunitySuspensionMetadata {
  suspendFrom?: string | null;
  suspensionMessage?: string | null;
  suspendedBy?: 'operator' | 'department' | null;
}

export type OpportunityDetail = OpportunityDetailResponse &
  OpportunitySuspensionMetadata;
export type OpportunitiesResponse = OpportunityListResponse;
export type Opportunity = AdminOpportunitySummaryItem &
  OpportunitySuspensionMetadata;

export type AdminOpportunity = AdminOpportunitySummaryItem &
  OpportunitySuspensionMetadata;
export type AdminOpportunityDetail = OpportunityDetailAdminResponse &
  OpportunitySuspensionMetadata;

export type OpportunityStatus = OpportunitySummaryItem['status'];
export type AdminOpportunityStatusFilter = ListOperatorOpportunitiesStatus;

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

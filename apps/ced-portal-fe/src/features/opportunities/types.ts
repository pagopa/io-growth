import { AdminOpportunitySummaryItem } from '../../core/api/generated/model';
import type { ApproveOpportunityBody } from '../../core/api/generated/model/approveOpportunityBody';
import type { ListOperatorOpportunitiesStatus } from '../../core/api/generated/model/listOperatorOpportunitiesStatus';
import type { OpportunityDetailAdminResponse } from '../../core/api/generated/model/opportunityDetailAdminResponse';
import type { OpportunityDetailResponse } from '../../core/api/generated/model/opportunityDetailResponse';
import type { OpportunityListResponse } from '../../core/api/generated/model/opportunityListResponse';
export { type LocalizedMetadataItem } from '../../core/api/generated/model/localizedMetadataItem';
export type { OpportunitySummaryItemStatus as OpportunityStatus } from '../../core/api/generated/model/opportunitySummaryItemStatus';
export { OpportunitySummaryItemStatus as OpportunityStatusEnum } from '../../core/api/generated/model/opportunitySummaryItemStatus';

export type OpportunityDetail = OpportunityDetailResponse;
export type OpportunitiesResponse = OpportunityListResponse;
export type Opportunity = AdminOpportunitySummaryItem;

export type AdminOpportunity = AdminOpportunitySummaryItem;
export type AdminOpportunityDetail = OpportunityDetailAdminResponse;

export interface ListAdminOpportunitiesParams {
  offset?: number;
  limit?: number;
  status?: ListOperatorOpportunitiesStatus;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  operatorId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type ApproveOpportunityPayload = ApproveOpportunityBody;

// UI-only filter state
export interface OpportunityFilters {
  search: string;
  state: string;
}

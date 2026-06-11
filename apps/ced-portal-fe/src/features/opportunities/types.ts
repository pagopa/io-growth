import type { ListOperatorOpportunitiesStatus } from '../../core/api/generated/model/listOperatorOpportunitiesStatus';
import type { LocalizedMetadataItem } from '../../core/api/generated/model/localizedMetadataItem';
import type { OpportunityDetailResponse } from '../../core/api/generated/model/opportunityDetailResponse';
import type { OpportunityListResponse } from '../../core/api/generated/model/opportunityListResponse';
import type { OpportunitySummaryItem } from '../../core/api/generated/model/opportunitySummaryItem';

export type { LocalizedMetadataItem };
export type OpportunityDetail = OpportunityDetailResponse;
export type OpportunitiesResponse = OpportunityListResponse;
export type Opportunity = OpportunitySummaryItem;
export { OpportunitySummaryItemStatus as OpportunityStatusEnum } from '../../core/api/generated/model/opportunitySummaryItemStatus';
export type { OpportunitySummaryItemStatus as OpportunityStatus } from '../../core/api/generated/model/opportunitySummaryItemStatus';

export interface AdminOpportunity extends Opportunity {
  operatorName?: string;
}

export interface AdminOpportunitiesResponse {
  items: AdminOpportunity[];
  total: number;
}

export interface AdminOpportunityDetail extends OpportunityDetail {
  operatorName?: string;
  nationalTerritory?: boolean;
}

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

export interface ApproveOpportunityPayload {
  dateFrom?: string;
}

// UI-only filter state
export interface OpportunityFilters {
  search: string;
  state: string;
}

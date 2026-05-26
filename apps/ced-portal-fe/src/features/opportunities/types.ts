export type { LocalizedMetadataItem } from '../../core/api/generated/model/localizedMetadataItem';
export type { OpportunityDetailResponse as OpportunityDetail } from '../../core/api/generated/model/opportunityDetailResponse';
export type { OpportunityListResponse as OpportunitiesResponse } from '../../core/api/generated/model/opportunityListResponse';
export type { OpportunitySummaryItem as Opportunity } from '../../core/api/generated/model/opportunitySummaryItem';
export { OpportunitySummaryItemStatus as OpportunityStatusEnum } from '../../core/api/generated/model/opportunitySummaryItemStatus';
export type { OpportunitySummaryItemStatus as OpportunityStatus } from '../../core/api/generated/model/opportunitySummaryItemStatus';

// UI-only filter state
export interface OpportunityFilters {
  search: string;
  state: string;
}

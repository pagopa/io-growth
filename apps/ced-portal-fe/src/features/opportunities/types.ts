// Re-exported from generated API model — do not edit manually.
// Run `pnpm generate` (from workspace root) to regenerate.
export type { OpportunitySummaryItem as Opportunity } from '../../api/generated/model/opportunitySummaryItem';
export type { OpportunitySummaryItemStatus as OpportunityStatus } from '../../api/generated/model/opportunitySummaryItemStatus';
export type { OpportunityListResponse as OpportunitiesResponse } from '../../api/generated/model/opportunityListResponse';
export type { OpportunityDetailResponse as OpportunityDetail } from '../../api/generated/model/opportunityDetailResponse';
export type { LocalizedMetadataItem } from '../../api/generated/model/localizedMetadataItem';

// UI-only filter state — not part of the OpenAPI schema.
export interface OpportunityFilters {
  search: string;
  state: string;
}

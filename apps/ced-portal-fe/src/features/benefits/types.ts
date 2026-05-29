import type { OpportunitySummaryItemStatus } from '../../core/api/generated/model/opportunitySummaryItemStatus';

export interface Benefit {
  id: string;
  name: string;
  status: OpportunitySummaryItemStatus;
  categoryTitle: string;
  dateFrom: string;
  dateTo: string | null;
}

export interface OpportunityCategory {
  id: string;
  title: string;
  description: string;
}

export interface BenefitsQueryParams {
  offset?: number;
  limit?: number;
  categoryId?: string;
  status?: OpportunitySummaryItemStatus;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BenefitsResponse {
  items: Benefit[];
  total: number;
}

export interface SaveBenefitDraftResponse {
  id: string;
  publication_status: OpportunitySummaryItemStatus;
  createdAt: string;
}

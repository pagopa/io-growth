import type { OpportunitySummaryItemStatus } from '../../core/api/generated/model';

export interface Benefit {
  id: string;
  name: string;
  categoryTitle: string;
  dateFrom: string;
  dateTo?: string | null;
  status: OpportunitySummaryItemStatus;
}

export interface BenefitsResponse {
  items: Benefit[];
  total: number;
}

export interface SaveBenefitDraftResponse {
  id: string;
  status: OpportunitySummaryItemStatus;
  createdAt: string;
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

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

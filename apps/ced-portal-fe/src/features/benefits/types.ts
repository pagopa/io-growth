export type OpportunityStatus =
  | 'draft'
  | 'test_pending'
  | 'test_rejected'
  | 'test_passed'
  | 'published'
  | 'suspended'
  | 'deleted';

export interface Benefit {
  id: string;
  name: string;
  status: OpportunityStatus;
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
  status?: OpportunityStatus;
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
  publication_status: string;
  createdAt: string;
}

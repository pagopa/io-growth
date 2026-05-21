import { PublicationStatus } from '../benefitsFilters/types';

export interface Benefit {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  publication_status: keyof typeof PublicationStatus;
}

export type BenefitsResponse = Benefit[];

export interface SaveBenefitDraftResponse {
  id: string;
  publication_status: keyof typeof PublicationStatus;
  createdAt: string;
}

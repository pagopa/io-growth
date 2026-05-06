import { BenefitStatus } from '../benefitsFilters/types';

export interface Benefit {
  name: string;
  category: string;
  createdAt: string;
  state: keyof typeof BenefitStatus;
}

export type BenefitsResponse = Benefit[];

export interface SaveBenefitDraftResponse {
  id: string;
  status: keyof typeof BenefitStatus;
  createdAt: string;
}

import { PublicationStatus } from '../benefitsFilters/types';

export type OpportunityApprovalStatus =
  | 'Da_gestire'
  | 'In_attesa_di_modifiche'
  | 'Approvata'
  | 'Non_attiva';

export interface Opportunity {
  id: string;
  name: string;
  organization_name: string;
  created_at: string;
  approval_status: OpportunityApprovalStatus;
}

export type OpportunitiesResponse = Opportunity[];

export interface OpportunityFilters {
  search: string;
  state: string;
}

export interface CompanionDetails {
  enabled: boolean;
  discount_type: string;
  discount_value: number;
}

export interface OpportunityDetail {
  id: string;
  name: string;
  organization_name: string;
  approval_status: OpportunityApprovalStatus;
  opportunity_type: string;
  discount_type: string;
  discount_value: number;
  description: string;
  category: string;
  validity_start: string;
  validity_end: string;
  conditions: string;
  companion: CompanionDetails;
  createdAt: string;
  publication_status: keyof typeof PublicationStatus;
}

export type OpportunityState =
  | 'Da_gestire'
  | 'In_attesa_di_modifiche'
  | 'Approvata'
  | 'Non_attiva';

export interface Opportunity {
  id: string;
  name: string;
  organization_name: string;
  created_at: string;
  state: OpportunityState;
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
  state: OpportunityState;
  opportunity_type: string;
  discount_type: string;
  discount_value: number;
  description: string;
  category: string;
  validity_start: string;
  validity_end: string;
  conditions: string;
  companion: CompanionDetails;
}

export type BenefitState =
  | 'Revisione'
  | 'Bozza'
  | 'Modifiche_Richieste'
  | 'Pubblicata'
  | 'Pubblicazione_Programmata';

export interface Benefit {
  name: string;
  category: string;
  created_by: string;
  state: BenefitState;
}

export type BenefitsResponse = Benefit[];

export interface SaveBenefitDraftResponse {
  id: string;
  status: 'Bozza';
  createdAt: string;
}

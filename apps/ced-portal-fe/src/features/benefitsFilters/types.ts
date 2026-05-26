import type { OpportunitySummaryItemStatus } from '../../core/api/generated/model';

export const publicationStatusLabels: Record<
  OpportunitySummaryItemStatus,
  string
> = {
  draft: 'In bozza',
  test_rejected: 'Rifiutato',
  test_pending: 'In fase di test',
  test_passed: 'Test superato',
  published: 'Pubblicata su IO',
  suspended: 'Sospesa',
  deleted: 'Eliminata',
};

export enum BenefitCategory {
  CULTURE_LEISURE = 'Cultura e tempo libero',
  EDUCATION = 'Istruzione e formazione',
  HEALTH_WELLNESS = 'Salute e benessere',
  SPORT = 'Sport',
  HOME = 'Casa',
  TELEPHONY_INTERNET = 'Telefonia e internet',
  FINANCIAL_SERVICES = 'Servizi finanziari',
  TRAVEL_TRANSPORT = 'Viaggi e Trasporti',
  SUSTAINABLE_MOBILITY = 'Mobilità sostenibile',
  WORK_INTERNSHIPS = 'Lavoro e tirocini',
}

export type BenefitFiltersState = {
  name: string | null;
  status: OpportunitySummaryItemStatus | null;
  category: BenefitCategory | null;
};

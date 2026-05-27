import { OpportunitySummaryItemStatus } from '../core/api/generated/model/opportunitySummaryItemStatus';

export const STATE_OPTIONS = [
  { value: 'Da_gestire', label: 'Da gestire' },
  { value: 'In_attesa_di_modifiche', label: 'In attesa di modifiche' },
  { value: 'Approvata', label: 'Approvata' },
  { value: 'Non_attiva', label: 'Non attiva' },
];

export const OPPORTUNITY_STATUS_OPTIONS: {
  value: OpportunitySummaryItemStatus;
  label: string;
}[] = [
  { value: OpportunitySummaryItemStatus.draft, label: 'Bozza' },
  { value: OpportunitySummaryItemStatus.test_pending, label: 'In test' },
  { value: OpportunitySummaryItemStatus.test_passed, label: 'Test superato' },
  { value: OpportunitySummaryItemStatus.published, label: 'Pubblicata' },
  { value: OpportunitySummaryItemStatus.suspended, label: 'Sospesa' },
  { value: OpportunitySummaryItemStatus.deleted, label: 'Eliminata' },
];

export type OpportunityStateColors =
  | 'default'
  | 'warning'
  | 'success'
  | 'info'
  | 'error';

export const OPPORTUNITY_STATUS_COLORS: Record<
  OpportunitySummaryItemStatus,
  OpportunityStateColors
> = {
  draft: 'default',
  test_pending: 'warning',
  test_passed: 'info',
  published: 'success',
  suspended: 'warning',
  deleted: 'error',
};

export const ENTITY_STATE_OPTIONS = [
  { value: 'Da_gestire', label: 'Da gestire' },
  { value: 'Rifiutata', label: 'Rifiutata' },
  { value: 'Attivo', label: 'Attivo' },
  { value: 'Inattivo', label: 'Inattivo' },
  { value: 'Cessato', label: 'Cessato' },
];

export const ENTITY_STATE_COLORS: Record<
  string,
  'default' | 'warning' | 'success' | 'info' | 'error'
> = {
  Da_gestire: 'warning',
  Rifiutata: 'default',
  Attivo: 'success',
  Inattivo: 'warning',
  Cessato: 'default',
};

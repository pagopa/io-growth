import { OpportunitySummaryItemStatus } from '../core/api/generated/model';

type OpportunityStateColors =
  | 'default'
  | 'warning'
  | 'success'
  | 'info'
  | 'error';

export const STATE_OPTIONS: {
  value: OpportunitySummaryItemStatus;
  label: string;
}[] = [
  { value: 'draft', label: 'Bozza' },
  { value: 'approval_pending', label: 'In attesa di approvazione' },
  { value: 'test_pending', label: 'In fase di test' },
  { value: 'test_passed', label: 'Test superato' },
  { value: 'published', label: 'Pubblicata' },
  { value: 'suspended', label: 'Sospesa' },
  { value: 'deleted', label: 'Eliminata' },
];

export const STATE_COLORS: Record<
  OpportunitySummaryItemStatus,
  OpportunityStateColors
> = {
  draft: 'default',
  approval_pending: 'info',
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
  (typeof ENTITY_STATE_OPTIONS)[number]['value'],
  OpportunityStateColors
> = {
  Da_gestire: 'warning',
  Rifiutata: 'default',
  Attivo: 'success',
  Inattivo: 'warning',
  Cessato: 'default',
};

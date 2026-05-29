import { ChipOwnProps } from '@mui/material';
import { OpportunitySummaryItemStatus } from '../core/api/generated/model';

export const STATE_OPTIONS: {
  value: OpportunitySummaryItemStatus;
  label: string;
}[] = [
  { value: OpportunitySummaryItemStatus.draft, label: 'Bozza' },
  { value: OpportunitySummaryItemStatus.test_pending, label: 'In test' },
  { value: OpportunitySummaryItemStatus.test_rejected, label: 'Rifiutato' },
  { value: OpportunitySummaryItemStatus.test_passed, label: 'Test superato' },
  { value: OpportunitySummaryItemStatus.published, label: 'Pubblicata' },
  { value: OpportunitySummaryItemStatus.suspended, label: 'Sospesa' },
  { value: OpportunitySummaryItemStatus.deleted, label: 'Eliminata' },
];

export const STATE_COLORS: Record<
  OpportunitySummaryItemStatus,
  ChipOwnProps['color']
> = {
  draft: 'default',
  test_pending: 'warning',
  test_passed: 'info',
  published: 'success',
  suspended: 'warning',
  deleted: 'error',
  test_rejected: 'default',
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

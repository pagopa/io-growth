import { ChipOwnProps } from '@mui/material';
import type { OpportunitySummaryItemStatus } from '../core/api/generated/model';

export const STATE_OPTIONS: {
  value: OpportunitySummaryItemStatus;
  label: string;
}[] = [
  { value: 'draft', label: 'Bozza' },
  { value: 'test_rejected', label: 'Rifiutato' },
  { value: 'test_pending', label: 'In fase di test' },
  { value: 'test_passed', label: 'Test superato' },
  { value: 'published', label: 'Pubblicata' },
  { value: 'suspended', label: 'Sospesa' },
  { value: 'deleted', label: 'Eliminata' },
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

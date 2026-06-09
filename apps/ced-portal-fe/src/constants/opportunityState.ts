import { ChipOwnProps } from '@mui/material';
import { OpportunitySummaryItemStatus } from '../core/api/generated/model';
import { ListOnboardingsStatus } from '../core/api/generated/model';

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
  { value: ListOnboardingsStatus.REQUEST, label: 'Richiesta' },
  { value: ListOnboardingsStatus.TOBEVALIDATED, label: 'Da validare' },
  { value: ListOnboardingsStatus.PENDING, label: 'In lavorazione' },
  {
    value: ListOnboardingsStatus.PENDING_IN_REVIEW,
    label: 'Da gestire',
  },
  { value: ListOnboardingsStatus.COMPLETED, label: 'Attivo' },
  { value: ListOnboardingsStatus.FAILED, label: 'Fallito' },
  { value: ListOnboardingsStatus.REJECTED, label: 'Rifiutato' },
  { value: ListOnboardingsStatus.DELETED, label: 'Cessato' },
];

export const ENTITY_REQUEST_STATE_OPTIONS = ENTITY_STATE_OPTIONS.filter(
  ({ value }) =>
    value === ListOnboardingsStatus.REQUEST ||
    value === ListOnboardingsStatus.TOBEVALIDATED ||
    value === ListOnboardingsStatus.PENDING ||
    value === ListOnboardingsStatus.PENDING_IN_REVIEW,
);

export const ENTITY_MANAGED_STATE_OPTIONS = ENTITY_STATE_OPTIONS.filter(
  ({ value }) =>
    value === ListOnboardingsStatus.COMPLETED ||
    value === ListOnboardingsStatus.FAILED ||
    value === ListOnboardingsStatus.REJECTED ||
    value === ListOnboardingsStatus.DELETED,
);

export const ENTITY_STATE_COLORS: Record<
  string,
  'default' | 'warning' | 'success' | 'info' | 'error'
> = {
  [ListOnboardingsStatus.REQUEST]: 'default',
  [ListOnboardingsStatus.TOBEVALIDATED]: 'warning',
  [ListOnboardingsStatus.PENDING]: 'warning',
  [ListOnboardingsStatus.PENDING_IN_REVIEW]: 'warning',
  [ListOnboardingsStatus.COMPLETED]: 'success',
  [ListOnboardingsStatus.FAILED]: 'error',
  [ListOnboardingsStatus.REJECTED]: 'default',
  [ListOnboardingsStatus.DELETED]: 'default',
};

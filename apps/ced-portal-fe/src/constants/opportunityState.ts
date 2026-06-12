import { ChipOwnProps } from '@mui/material';
import {
  ListOnboardingsStatusesItem,
  OpportunitySummaryItemStatus,
} from '../core/api/generated/model';

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
  { value: ListOnboardingsStatusesItem.REQUEST, label: 'Richiesta' },
  {
    value: ListOnboardingsStatusesItem.TOBEVALIDATED,
    label: 'Da validare',
  },
  { value: ListOnboardingsStatusesItem.PENDING, label: 'In lavorazione' },
  {
    value: ListOnboardingsStatusesItem.PENDING_IN_REVIEW,
    label: 'Da gestire',
  },
  { value: ListOnboardingsStatusesItem.COMPLETED, label: 'Attivo' },
  { value: ListOnboardingsStatusesItem.FAILED, label: 'Inattivo' },
  { value: ListOnboardingsStatusesItem.REJECTED, label: 'Rifiutato' },
  { value: ListOnboardingsStatusesItem.DELETED, label: 'Cessato' },
];

export const ENTITY_REQUEST_STATE_OPTIONS = ENTITY_STATE_OPTIONS.filter(
  ({ value }) =>
    value === ListOnboardingsStatusesItem.PENDING_IN_REVIEW ||
    value === ListOnboardingsStatusesItem.REJECTED,
);

export const ENTITY_MANAGED_STATE_OPTIONS = ENTITY_STATE_OPTIONS.filter(
  ({ value }) =>
    value === ListOnboardingsStatusesItem.COMPLETED ||
    value === ListOnboardingsStatusesItem.FAILED ||
    value === ListOnboardingsStatusesItem.DELETED,
);

export const ENTITY_STATE_COLORS: Record<
  string,
  'default' | 'warning' | 'success' | 'info' | 'error'
> = {
  [ListOnboardingsStatusesItem.REQUEST]: 'default',
  [ListOnboardingsStatusesItem.TOBEVALIDATED]: 'warning',
  [ListOnboardingsStatusesItem.PENDING]: 'warning',
  [ListOnboardingsStatusesItem.PENDING_IN_REVIEW]: 'warning',
  [ListOnboardingsStatusesItem.COMPLETED]: 'success',
  [ListOnboardingsStatusesItem.FAILED]: 'error',
  [ListOnboardingsStatusesItem.REJECTED]: 'default',
  [ListOnboardingsStatusesItem.DELETED]: 'default',
};

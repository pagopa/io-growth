import { ChipOwnProps } from '@mui/material';
import {
  ListOnboardingsStatusesItem,
  OpportunitySummaryItemStatus,
} from '../core/api/generated/model';

export const STATE_OPTIONS: {
  value: OpportunitySummaryItemStatus;
  label: string;
}[] = [
  { value: OpportunitySummaryItemStatus.draft, label: 'In bozza' },
  { value: OpportunitySummaryItemStatus.test_pending, label: 'Da gestire' },
  {
    value: OpportunitySummaryItemStatus.test_rejected,
    label: 'In attesa di modifiche',
  },
  {
    value: OpportunitySummaryItemStatus.scheduled,
    label: 'Pubblicazione programmata',
  },
  {
    value: OpportunitySummaryItemStatus.scheduled_suspension,
    label: 'Sospensione programmata',
  },
  { value: OpportunitySummaryItemStatus.published, label: 'Pubblicata su IO' },
  { value: OpportunitySummaryItemStatus.suspended, label: 'Sospesa' },
  { value: OpportunitySummaryItemStatus.deleted, label: 'Eliminata' },
];

export const ADMIN_REQUEST_STATE_OPTIONS = STATE_OPTIONS.filter(
  ({ value }) =>
    value === OpportunitySummaryItemStatus.test_rejected ||
    value === OpportunitySummaryItemStatus.test_pending ||
    value === OpportunitySummaryItemStatus.draft,
);

export const ADMIN_APPROVED_STATE_OPTIONS = STATE_OPTIONS.filter(
  ({ value }) =>
    value === OpportunitySummaryItemStatus.scheduled ||
    value === OpportunitySummaryItemStatus.scheduled_suspension ||
    value === OpportunitySummaryItemStatus.test_passed ||
    value === OpportunitySummaryItemStatus.published,
);

export const ADMIN_NOT_ACTIVE_STATE_OPTIONS = STATE_OPTIONS.filter(
  ({ value }) =>
    value === OpportunitySummaryItemStatus.suspended ||
    value === OpportunitySummaryItemStatus.deleted,
);

export const OPERATOR_STATE_OPTIONS: {
  value: OpportunitySummaryItemStatus;
  label: string;
}[] = [
  { value: OpportunitySummaryItemStatus.draft, label: 'In bozza' },
  { value: OpportunitySummaryItemStatus.test_pending, label: 'In revisione' },
  { value: OpportunitySummaryItemStatus.test_rejected, label: 'Da modificare' },
  {
    value: OpportunitySummaryItemStatus.scheduled,
    label: 'Pubblicazione programmata',
  },
  {
    value: OpportunitySummaryItemStatus.test_passed,
    label: 'Pubblicazione programmata',
  },
  { value: OpportunitySummaryItemStatus.published, label: 'Pubblicata su IO' },
  { value: OpportunitySummaryItemStatus.suspended, label: 'Sospesa' },
  {
    value: OpportunitySummaryItemStatus.scheduled_suspension,
    label: 'Sospensione programmata',
  },
  { value: OpportunitySummaryItemStatus.deleted, label: 'Eliminata' },
];

export const OPERATOR_REQUEST_STATE_OPTIONS = OPERATOR_STATE_OPTIONS.filter(
  ({ value }) =>
    value === OpportunitySummaryItemStatus.draft ||
    value === OpportunitySummaryItemStatus.test_rejected ||
    value === OpportunitySummaryItemStatus.test_pending,
);

export const OPERATOR_MANAGED_STATE_OPTIONS = OPERATOR_STATE_OPTIONS.filter(
  ({ value }) =>
    value === OpportunitySummaryItemStatus.scheduled ||
    value === OpportunitySummaryItemStatus.scheduled_suspension ||
    value === OpportunitySummaryItemStatus.published ||
    value === OpportunitySummaryItemStatus.suspended ||
    value === OpportunitySummaryItemStatus.deleted,
);

export const STATE_COLORS: Record<
  OpportunitySummaryItemStatus,
  ChipOwnProps['color']
> = {
  draft: 'default',
  test_pending: 'warning',
  scheduled: 'info',
  scheduled_suspension: 'info',
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

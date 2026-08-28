import type { MIChipProps } from '@pagopa/mui-italia';
import type { OpportunitySummaryItemStatus } from '../../../core/api/generated/model';

export const opportunityStatusLabelMap: Record<
  OpportunitySummaryItemStatus,
  { text: string; color: MIChipProps['color'] }
> = {
  draft: { text: 'Bozza', color: 'default' },
  test_pending: { text: 'In test', color: 'info' },
  test_passed: { text: 'Test superato', color: 'success' },
  scheduled: { text: 'Pubblicazione programmata', color: 'highlight' },
  scheduled_suspension: {
    text: 'Sospensione programmata',
    color: 'highlight',
  },
  published: { text: 'Pubblicata', color: 'success' },
  suspended: { text: 'Sospesa', color: 'default' },
  deleted: { text: 'Eliminata', color: 'error' },
  test_rejected: {
    text: '',
    color: 'default',
  },
};

export const benefitStateLabelMap: Record<
  OpportunitySummaryItemStatus,
  { text: string; color: MIChipProps['color'] }
> = {
  draft: { text: 'In bozza', color: 'default' },
  test_rejected: { text: 'Rifiutato', color: 'error' },
  test_pending: { text: 'In revisione', color: 'info' },
  //TODO for now its a duplicated state, we can review it after demo
  test_passed: { text: 'Pubblicazione programmata', color: 'highlight' },
  scheduled: { text: 'Pubblicazione programmata', color: 'highlight' },
  scheduled_suspension: {
    text: 'Sospensione programmata',
    color: 'highlight',
  },
  published: { text: 'Pubblicata su IO', color: 'success' },
  suspended: { text: 'Sospesa', color: 'default' },
  deleted: { text: 'Eliminata', color: 'error' },
};

import { ChipColors } from '@pagopa/mui-italia';
import { OpportunitySummaryItemStatus } from '../../../core/api/generated/model';

export const opportunityStatusLabelMap: Record<
  OpportunitySummaryItemStatus,
  { text: string; color: ChipColors }
> = {
  draft: { text: 'Bozza', color: 'default' },
  test_pending: { text: 'In test', color: 'primary' },
  test_passed: { text: 'Test superato', color: 'success' },
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
  { text: string; color: ChipColors }
> = {
  draft: { text: 'In bozza', color: 'default' },
  test_rejected: { text: 'Rifiutato', color: 'error' },
  test_pending: { text: 'In fase di test', color: 'warning' },
  test_passed: { text: 'Test superato', color: 'info' },
  published: { text: 'Pubblicata su IO', color: 'success' },
  suspended: { text: 'Sospesa', color: 'default' },
  deleted: { text: 'Eliminata', color: 'error' },
};

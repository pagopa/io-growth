import { ChipColors } from '@pagopa/mui-italia';
import type { OpportunitySummaryItemStatus } from '../../../core/api/generated/model';

export const benefitStateLabelMap: Record<
  OpportunitySummaryItemStatus,
  { text: string; color: ChipColors }
> = {
  draft: { text: 'In bozza', color: 'default' },
  approval_pending: { text: 'In attesa di approvazione', color: 'info' },
  test_pending: { text: 'In fase di test', color: 'warning' },
  test_passed: { text: 'Test superato', color: 'info' },
  published: { text: 'Pubblicata su IO', color: 'success' },
  suspended: { text: 'Sospesa', color: 'default' },
  deleted: { text: 'Eliminata', color: 'error' },
};

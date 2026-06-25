import { OpportunitySummaryItemStatus } from '../core/api/generated/model';

export const getDisplayStatus = (
  status: OpportunitySummaryItemStatus,
  dateFrom?: string | Date,
): OpportunitySummaryItemStatus => {
  const managedStatuses: OpportunitySummaryItemStatus[] = [
    'published',
    'test_passed',
  ];

  if (!managedStatuses.includes(status)) {
    return status;
  }

  if (!dateFrom) return 'test_passed';

  const fromDate = new Date(dateFrom);
  if (isNaN(fromDate.getTime())) return 'test_passed';

  return new Date() >= fromDate ? 'published' : 'test_passed';
};

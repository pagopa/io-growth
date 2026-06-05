import { useMemo } from 'react';
import type {
  ListOperatorOpportunitiesParams,
  OpportunitySummaryItemStatus,
} from '../../core/api/generated/model';
import { useGetBenefitsQuery } from './api';

const IN_MANAGEMENT_STATES: Set<OpportunitySummaryItemStatus> = new Set([
  'draft',
  'test_rejected',
  'test_pending',
]);
const APPROVED_STATES: Set<OpportunitySummaryItemStatus> = new Set([
  'test_passed',
  'published',
]);

export const useBenefitsData = (params: ListOperatorOpportunitiesParams) => {
  const query = useGetBenefitsQuery(params, {
    refetchOnMountOrArgChange: true,
  });

  const items = useMemo(() => query.data?.items ?? [], [query.data]);

  const total = useMemo(() => query.data?.total ?? 0, [query.data]);

  const inManagementItems = useMemo(
    () => items.filter((item) => IN_MANAGEMENT_STATES.has(item.status)),
    [items],
  );

  const approvedItems = useMemo(
    () => items.filter((item) => APPROVED_STATES.has(item.status)),
    [items],
  );

  return {
    ...query,
    items,
    inManagementItems,
    approvedItems,
    total,
  };
};

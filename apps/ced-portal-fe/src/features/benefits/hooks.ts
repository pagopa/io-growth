import { useMemo } from 'react';
import { useGetBenefitsQuery } from './api';
import type { Benefit, BenefitsQueryParams, OpportunityStatus } from './types';
import { OpportunitySummaryItemStatus } from '../../core/api/generated/model/opportunitySummaryItemStatus';

const IN_MANAGEMENT_STATES: Set<OpportunityStatus> = new Set([
  OpportunitySummaryItemStatus.draft,
  OpportunitySummaryItemStatus.test_pending,
  OpportunitySummaryItemStatus.test_passed,
]);

const APPROVED_STATES: Set<OpportunityStatus> = new Set([
  OpportunitySummaryItemStatus.published,
  OpportunitySummaryItemStatus.suspended,
  OpportunitySummaryItemStatus.deleted,
]);

export const useBenefitsData = (params: BenefitsQueryParams) => {
  const query = useGetBenefitsQuery(params);

  const items = useMemo<Benefit[]>(() => query.data?.items ?? [], [query.data]);

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

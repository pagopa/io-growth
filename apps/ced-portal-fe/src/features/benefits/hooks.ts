import { useMemo } from 'react';
import { useAppSelector } from '../../hooks';
import {
  selectBenefitCategoryFilter,
  selectBenefitNameFilter,
  selectBenefitStatusFilter,
} from '../benefitsFilters/selectors';
import type { OpportunitySummaryItemStatus } from '../../core/api/generated/model';
import { useGetBenefitsQuery } from './api';
import type { Benefit } from './types';

const IN_MANAGEMENT_STATES: Set<OpportunitySummaryItemStatus> = new Set([
  'draft',
  'approval_pending',
]);
const APPROVED_STATES: Set<OpportunitySummaryItemStatus> = new Set([
  'test_pending',
  'test_passed',
  'published',
]);

const getFilteredItems = (
  items: Benefit[],
  targetStates: Set<OpportunitySummaryItemStatus>,
  filters: {
    nameFilter: ReturnType<typeof selectBenefitNameFilter>;
    categoryFilter: ReturnType<typeof selectBenefitCategoryFilter>;
    statusFilter: ReturnType<typeof selectBenefitStatusFilter>;
  },
) => {
  const { nameFilter, statusFilter } = filters;

  const filtered = items.filter(({ status, name }) => {
    if (!targetStates.has(status)) {
      return false;
    }

    const matchesName =
      !nameFilter || name.toLowerCase().includes(nameFilter.toLowerCase());

    const matchesStatus = !statusFilter || status === statusFilter;

    return matchesName && matchesStatus;
  });

  return filtered;
};

export const useBenefitsData = () => {
  const query = useGetBenefitsQuery();

  const nameFilter = useAppSelector(selectBenefitNameFilter);
  const statusFilter = useAppSelector(selectBenefitStatusFilter);
  const categoryFilter = useAppSelector(selectBenefitCategoryFilter);

  const items = useMemo(() => query.data?.items ?? [], [query.data]);

  const inManagementItems = useMemo(
    () =>
      getFilteredItems(items, IN_MANAGEMENT_STATES, {
        nameFilter,
        categoryFilter,
        statusFilter,
      }),
    [categoryFilter, items, nameFilter, statusFilter],
  );

  const approvedItems = useMemo(
    () =>
      getFilteredItems(items, APPROVED_STATES, {
        nameFilter,
        categoryFilter,
        statusFilter,
      }),
    [categoryFilter, items, nameFilter, statusFilter],
  );

  return {
    ...query,
    items,
    inManagementItems,
    approvedItems,
    hasItems: Boolean(items.length),
  };
};

export const formatBenefitRow = (item: Benefit) => {
  return `${item.name} · ${item.categoryTitle} · ${item.dateFrom} · ${item.status}`;
};

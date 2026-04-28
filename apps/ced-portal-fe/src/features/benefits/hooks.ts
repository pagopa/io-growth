import { useMemo } from 'react';
import { useGetBenefitsQuery } from './api';
import type { Benefit, BenefitsResponse } from './types';
import { useAppSelector } from '../../hooks';
import {
  selectBenefitCategoryFilter,
  selectBenefitNameFilter,
  selectBenefitStatusFilter,
} from '../benefitsFilters/selectors';
import { BenefitStatus } from '../benefitsFilters/types';

const IN_MANAGEMENT_STATES: Set<keyof typeof BenefitStatus> = new Set([
  'DRAFT',
  'UNDER_REVIEW',
  'CHANGES_REQUESTED',
]);
const APPROVED_STATES: Set<keyof typeof BenefitStatus> = new Set([
  'PUBLISHED',
  'SCHEDULED_PUBLICATION',
]);

const getFilteredItems = (
  items: BenefitsResponse,
  targetStates: Set<keyof typeof BenefitStatus>,
  filters: {
    nameFilter: ReturnType<typeof selectBenefitNameFilter>;
    categoryFilter: ReturnType<typeof selectBenefitCategoryFilter>;
    statusFilter: ReturnType<typeof selectBenefitStatusFilter>;
  },
) => {
  const { nameFilter, categoryFilter, statusFilter } = filters;

  return items.filter(({ state, name, category }) => {
    if (!targetStates.has(state)) {
      return false;
    }

    const matchesName =
      !nameFilter || name.toLowerCase().includes(nameFilter.toLowerCase());
    console.log('matchesName:', matchesName);
    const matchesCategory = !categoryFilter || category === categoryFilter;
    console.log('matchesCategory:', matchesCategory);
    const matchesStatus = !statusFilter || state === statusFilter;
    console.log('matchesStatus:', matchesStatus);

    return matchesName && matchesCategory && matchesStatus;
  });
};

export const useBenefitsData = () => {
  const query = useGetBenefitsQuery();

  const nameFilter = useAppSelector(selectBenefitNameFilter);
  const statusFilter = useAppSelector(selectBenefitStatusFilter);
  const categoryFilter = useAppSelector(selectBenefitCategoryFilter);

  const items = useMemo(() => query.data ?? [], [query.data]);

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
  return `${item.name} · ${item.category} · ${item.createdAt} · ${item.state}`;
};

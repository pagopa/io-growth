import { useMemo } from 'react';
import { useGetBenefitsQuery } from './api';
import type { Benefit, BenefitsResponse } from './types';
import { useAppSelector } from '../../hooks';
import {
  selectBenefitCategoryFilter,
  selectBenefitNameFilter,
  selectBenefitStatusFilter,
} from '../benefitsFilters/selectors';
import { PublicationStatus } from '../benefitsFilters/types';

const IN_MANAGEMENT_STATES: Set<keyof typeof PublicationStatus> = new Set([
  'DRAFT',
  'UNDER_REVIEW',
  'CHANGES_REQUESTED',
]);
const APPROVED_STATES: Set<keyof typeof PublicationStatus> = new Set([
  'PUBLISHED',
  'SCHEDULED_PUBLICATION',
]);

const getFilteredItems = (
  items: BenefitsResponse,
  targetStates: Set<keyof typeof PublicationStatus>,
  filters: {
    nameFilter: ReturnType<typeof selectBenefitNameFilter>;
    categoryFilter: ReturnType<typeof selectBenefitCategoryFilter>;
    statusFilter: ReturnType<typeof selectBenefitStatusFilter>;
  },
) => {
  console.log(items, 'getFilteredItems >>>>>>');
  const { nameFilter, categoryFilter, statusFilter } = filters;

  const filtered = items.filter(
    ({ publication_status, name, category, ...rest }) => {
      console.log(
        {
          item: { publication_status, name, category, ...rest },
          targetStates,
          check: !targetStates.has(publication_status),
        },
        'getFilteredItems >>>>>>',
      );

      if (!targetStates.has(publication_status)) {
        return false;
      }

      const matchesName =
        !nameFilter || name.toLowerCase().includes(nameFilter.toLowerCase());

      const matchesCategory = !categoryFilter || category === categoryFilter;

      const matchesStatus =
        !statusFilter || publication_status === statusFilter;

      return matchesName && matchesCategory && matchesStatus;
    },
  );
  console.log(filtered, 'getFilteredItems >>>>>> filtered');

  return filtered;
};

export const useBenefitsData = () => {
  const query = useGetBenefitsQuery();

  const nameFilter = useAppSelector(selectBenefitNameFilter);
  const statusFilter = useAppSelector(selectBenefitStatusFilter);
  const categoryFilter = useAppSelector(selectBenefitCategoryFilter);

  const items = useMemo(() => query.data ?? [], [query.data]);
  console.log('🚀 ~ useBenefitsData ~ items:', items);

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
  return `${item.name} · ${item.category} · ${item.createdAt} · ${item.publication_status}`;
};

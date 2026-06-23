import { useMemo } from 'react';
import {
  ListOperatorOpportunitiesParams,
  ListOperatorOpportunitiesStatus,
  type ListOperatorOpportunitiesStatus as ListOperatorOpportunitiesStatusType,
} from '../../core/api/generated/model';
import {
  useGetAdminOpportunitiesQuery,
  useGetOperatorOpportunitiesQuery,
} from './api';
import type {
  AdminOpportunity,
  Opportunity,
  OpportunityFilters,
  OpportunityStatus,
} from './types';
import { OpportunityStatusEnum } from './types';

const NEW_STATES: Set<OpportunityStatus> = new Set([
  OpportunityStatusEnum.draft,
  OpportunityStatusEnum.test_rejected,
  OpportunityStatusEnum.test_pending,
]);
const APPROVED_STATES: Set<OpportunityStatus> = new Set([
  OpportunityStatusEnum.test_passed,
  OpportunityStatusEnum.published,
]);
const INACTIVE_STATES: Set<OpportunityStatus> = new Set([
  OpportunityStatusEnum.suspended,
  OpportunityStatusEnum.deleted,
]);

const matchesSearch = (item: Opportunity, search: string): boolean => {
  if (!search) return true;
  const q = search.toLowerCase();
  return item.name.toLowerCase().includes(q);
};

const matchesState = (item: Opportunity, state: string): boolean => {
  if (!state) return true;
  return item.status === state;
};

const isListOperatorOpportunitiesStatus = (
  value: string,
): value is ListOperatorOpportunitiesStatusType =>
  Object.values(ListOperatorOpportunitiesStatus).includes(
    value as ListOperatorOpportunitiesStatusType,
  );

export const useOpportunitiesData = (filters: OpportunityFilters) => {
  const status = isListOperatorOpportunitiesStatus(filters.state)
    ? filters.state
    : undefined;

  const query = useGetAdminOpportunitiesQuery(
    {
      limit: 100,
      search: filters.search || undefined,
      status,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const items = useMemo<AdminOpportunity[]>(
    () => query.data?.items ?? [],
    [query.data],
  );

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          matchesSearch(item, filters.search) &&
          matchesState(item, filters.state),
      ),
    [items, filters],
  );

  const newItems = useMemo(
    () => filteredItems.filter((item) => NEW_STATES.has(item.status)),
    [filteredItems],
  );

  const approvedItems = useMemo(
    () => filteredItems.filter((item) => APPROVED_STATES.has(item.status)),
    [filteredItems],
  );

  const inactiveItems = useMemo(
    () => filteredItems.filter((item) => INACTIVE_STATES.has(item.status)),
    [filteredItems],
  );

  return {
    ...query,
    items: filteredItems,
    newItems,
    approvedItems,
    inactiveItems,
  };
};

export const useBenefitsData = (params: ListOperatorOpportunitiesParams) => {
  const query = useGetOperatorOpportunitiesQuery(params, {
    refetchOnMountOrArgChange: true,
  });

  const items = useMemo(() => query.data?.items ?? [], [query.data]);

  const total = useMemo(() => query.data?.total ?? 0, [query.data]);

  const inManagementItems = useMemo(
    () => items.filter((item) => NEW_STATES.has(item.status)),
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

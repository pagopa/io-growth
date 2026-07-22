import { useMemo } from 'react';
import {
  type ListOperatorOpportunitiesParams,
  ListOperatorOpportunitiesStatus,
} from '../../core/api/generated/model';
import {
  useGetAdminOpportunitiesQuery,
  useGetOperatorOpportunitiesQuery,
} from './api';
import type {
  AdminOpportunityStatusFilter,
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
  OpportunityStatusEnum.scheduled,
  OpportunityStatusEnum.published,
  OpportunityStatusEnum.scheduled_suspension,
]);
const INACTIVE_STATES: Set<OpportunityStatus> = new Set([
  OpportunityStatusEnum.suspended,
  OpportunityStatusEnum.deleted,
]);

const matchesState = (item: Opportunity, state: string): boolean => {
  if (!state) return true;
  return item.status === state;
};

const isListOperatorOpportunitiesStatus = (
  value: string,
): value is AdminOpportunityStatusFilter =>
  Object.values(ListOperatorOpportunitiesStatus).includes(
    value as ListOperatorOpportunitiesStatus,
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
    () => items.filter((item) => matchesState(item, filters.state)),
    [filters.state, items],
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
    () =>
      items.filter(
        (item) =>
          matchesState(item, filters.state) && INACTIVE_STATES.has(item.status),
      ),
    [filters.state, items],
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

  const items = useMemo<Opportunity[]>(
    () => (query.data?.items ?? []) as Opportunity[],
    [query.data],
  );

  const visibleItems = useMemo(() => items, [items]);

  const total = useMemo(() => visibleItems.length, [visibleItems]);

  const inManagementItems = useMemo(
    () => visibleItems.filter((item) => NEW_STATES.has(item.status)),
    [visibleItems],
  );

  const approvedItems = useMemo(
    () => visibleItems.filter((item) => APPROVED_STATES.has(item.status)),
    [visibleItems],
  );

  return {
    ...query,
    items: visibleItems,
    inManagementItems,
    approvedItems,
    total,
  };
};

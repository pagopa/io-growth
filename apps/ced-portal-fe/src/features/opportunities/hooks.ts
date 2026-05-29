import { useMemo } from 'react';
import { useGetOpportunitiesQuery } from './api';
import type {
  Opportunity,
  OpportunityFilters,
  OpportunityStatus,
} from './types';
import { OpportunityStatusEnum } from './types';

const NEW_STATES: Set<OpportunityStatus> = new Set([
  OpportunityStatusEnum.draft,
  OpportunityStatusEnum.test_rejected,
]);
const APPROVED_STATES: Set<OpportunityStatus> = new Set([
  OpportunityStatusEnum.test_pending,
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

export const useOpportunitiesData = (filters: OpportunityFilters) => {
  const query = useGetOpportunitiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const items = useMemo(() => query.data?.items ?? [], [query.data]);

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

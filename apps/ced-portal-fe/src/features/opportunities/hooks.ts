import { useMemo } from 'react';
import { useGetOpportunitiesQuery } from './api';
import type {
  Opportunity,
  OpportunityFilters,
  OpportunityState,
} from './types';

const NEW_STATES: Set<OpportunityState> = new Set([
  'Da_gestire',
  'In_attesa_di_modifiche',
]);
const APPROVED_STATES: Set<OpportunityState> = new Set(['Approvata']);
const INACTIVE_STATES: Set<OpportunityState> = new Set(['Non_attiva']);

const matchesSearch = (item: Opportunity, search: string): boolean => {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    item.name.toLowerCase().includes(q) ||
    item.organization_name.toLowerCase().includes(q)
  );
};

const matchesState = (item: Opportunity, state: string): boolean => {
  if (!state) return true;
  return item.state === state;
};

export const useOpportunitiesData = (filters: OpportunityFilters) => {
  const query = useGetOpportunitiesQuery();

  const items = useMemo(() => query.data ?? [], [query.data]);

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
    () => filteredItems.filter((item) => NEW_STATES.has(item.state)),
    [filteredItems],
  );

  const approvedItems = useMemo(
    () => filteredItems.filter((item) => APPROVED_STATES.has(item.state)),
    [filteredItems],
  );

  const inactiveItems = useMemo(
    () => filteredItems.filter((item) => INACTIVE_STATES.has(item.state)),
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

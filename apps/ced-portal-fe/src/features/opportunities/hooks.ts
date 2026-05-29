import { useMemo } from 'react';
import { useGetOpportunitiesQuery } from './api';
import type {
  Opportunity,
  OpportunityFilters,
  OpportunityApprovalStatus,
} from './types';

const NEW_STATES: Set<OpportunityApprovalStatus> = new Set([
  'Da_gestire',
  'In_attesa_di_modifiche',
]);
const APPROVED_STATES: Set<OpportunityApprovalStatus> = new Set(['Approvata']);
const INACTIVE_STATES: Set<OpportunityApprovalStatus> = new Set(['Non_attiva']);

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
  return item.approval_status === state;
};

export const useOpportunitiesData = (filters: OpportunityFilters) => {
  const query = useGetOpportunitiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

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
    () => filteredItems.filter((item) => NEW_STATES.has(item.approval_status)),
    [filteredItems],
  );

  const approvedItems = useMemo(
    () =>
      filteredItems.filter((item) => APPROVED_STATES.has(item.approval_status)),
    [filteredItems],
  );

  const inactiveItems = useMemo(
    () =>
      filteredItems.filter((item) => INACTIVE_STATES.has(item.approval_status)),
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

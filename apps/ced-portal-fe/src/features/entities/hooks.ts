import { useMemo } from 'react';
import { useGetEntitiesQuery } from './api.js';
import type { EntityFilters, EntityItem } from './types.js';

const matchesSearch = (item: EntityItem, search: string): boolean => {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    item.name.toLowerCase().includes(q) || item.city.toLowerCase().includes(q)
  );
};

const matchesState = (item: EntityItem, state: string): boolean => {
  if (!state) return true;
  return item.state === state;
};

export const useEntitiesData = (filters: EntityFilters) => {
  const query = useGetEntitiesQuery();

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

  const requestItems = useMemo(
    () => filteredItems.filter((item) => item.tab === 'requests'),
    [filteredItems],
  );

  const entityItems = useMemo(
    () => filteredItems.filter((item) => item.tab === 'entities'),
    [filteredItems],
  );

  return {
    ...query,
    items: filteredItems,
    requestItems,
    entityItems,
  };
};

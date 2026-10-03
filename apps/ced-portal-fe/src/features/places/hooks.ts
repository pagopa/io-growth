import { useMemo } from 'react';
import type { PlaceListItem } from '../../generated/model';
import { useGetPlacesQuery } from './api';

type PlacesFilter = {
  search: string;
  tab?: number;
  page?: number;
  limit?: number;
};

export const usePlacesData = (filters: PlacesFilter) => {
  const typeMap = ['both', 'offline', 'online'];
  const mappedType = typeMap[filters?.tab ?? 0];

  const query = useGetPlacesQuery(
    {
      search: filters.search || undefined,
      type: mappedType,
      limit: filters.limit,
      offset: ((filters.page ?? 1) - 1) * (filters.limit ?? 10),
    },
    { refetchOnMountOrArgChange: true },
  );

  const items = useMemo<PlaceListItem[]>(() => {
    const data = query?.data;
    return data && data.items ? data.items : [];
  }, [query.data]);

  const total = useMemo<number>(() => {
    const data = query?.data;
    return data?.total ?? 0;
  }, [query.data]);

  return {
    ...query,
    items,
    total,
  };
};

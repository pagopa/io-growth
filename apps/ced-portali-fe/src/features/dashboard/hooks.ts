import { useGetDashboardQuery } from './api';

export function useDashboardData() {
  const query = useGetDashboardQuery();

  return {
    ...query,
    items: query.data?.items ?? [],
    hasItems: Boolean(query.data?.items.length),
  };
}

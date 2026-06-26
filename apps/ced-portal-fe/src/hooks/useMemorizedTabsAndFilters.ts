import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useMemorizedTabsAndFilters = <
  TFilters extends Record<string, any>,
>(
  initialFilters: TFilters,
  defaultLimit = 5,
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = parseInt(searchParams.get('tab') || '0', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || String(defaultLimit), 10);

  const filters = useMemo(() => {
    const currentFilters = { ...initialFilters };

    Object.keys(initialFilters).forEach((key) => {
      const urlValue = searchParams.get(key);
      if (urlValue !== null) {
        (currentFilters as Record<string, any>)[key] = urlValue;
      }
    });

    return currentFilters;
  }, [initialFilters, searchParams]);

  const updateParams = (
    newValues: Record<string, string | number | undefined>,
  ) => {
    const newParams = new URLSearchParams(searchParams);

    console.log(newValues, 'aijsihdai');

    Object.entries(newValues).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    setSearchParams(newParams, { replace: true });
  };

  return {
    tab,
    page,
    limit,
    filters,
    updateParams,
  };
};

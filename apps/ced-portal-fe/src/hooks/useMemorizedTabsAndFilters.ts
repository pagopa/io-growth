import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const parseSafeInt = (
  value: string | null,
  defaultValue: number,
  minValue: number,
) => {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < minValue) {
    return defaultValue;
  }
  return parsed;
};

export const useMemorizedTabsAndFilters = <
  TFilters extends { [K in keyof TFilters]: string },
>(
  initialFilters: TFilters,
  defaultLimit = 5,
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = parseSafeInt(searchParams.get('tab'), 0, 0);
  const page = parseSafeInt(searchParams.get('page'), 1, 1);
  const limit = parseSafeInt(searchParams.get('limit'), defaultLimit, 1);

  const filters = useMemo(() => {
    const currentFilters = { ...initialFilters };

    Object.keys(initialFilters).forEach((key) => {
      const urlValue = searchParams.get(key);
      if (urlValue !== null) {
        (currentFilters as Record<string, string>)[key] = urlValue;
      }
    });

    return currentFilters;
  }, [initialFilters, searchParams]);

  const updateParams = (
    newValues: Record<string, string | number | undefined | null>,
  ) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(newValues).forEach(([key, value]) => {
      if (value == null || value === '') {
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

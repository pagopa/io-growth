import { useCallback, useMemo, useState } from 'react';

export interface SortableColumn<T> {
  id: string;
  sortable?: boolean;
  sortAccessor?: (item: T) => string | number | null | undefined;
}

interface UseTableSortProps<T> {
  items: T[];
  columns: SortableColumn<T>[];
  defaultSortBy?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

export const useTableSort = <T>({
  items,
  columns,
  defaultSortBy = '',
  defaultSortDirection = 'asc',
}: UseTableSortProps<T>) => {
  const [sortBy, setSortBy] = useState<string>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    defaultSortDirection,
  );

  const handleSort = useCallback(
    (columnId: string, isSortable?: boolean) => {
      if (!isSortable) return;

      if (sortBy === columnId) {
        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(columnId);
        setSortDirection('asc');
      }
    },
    [sortBy],
  );

  const sortedItems = useMemo(() => {
    const selectedColumn = columns.find((col) => col.id === sortBy);

    if (!selectedColumn?.sortAccessor) {
      return items;
    }

    return [...items].sort((a, b) => {
      const left = selectedColumn.sortAccessor!(a);
      const right = selectedColumn.sortAccessor!(b);

      const compareResult =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left ?? '').localeCompare(String(right ?? ''), 'it', {
              sensitivity: 'base',
            });

      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [items, columns, sortBy, sortDirection]);

  return {
    sortedItems,
    sortBy,
    sortDirection,
    handleSort,
  };
};

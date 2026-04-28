import { useCallback, useMemo, useState } from 'react';

// Interfaccia generica che le colonne devono rispettare per poter essere ordinate
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
        // Se clicco sulla stessa colonna, inverto la direzione
        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      } else {
        // Se clicco su una colonna nuova, imposto l'ID e resetto ad 'asc'
        setSortBy(columnId);
        setSortDirection('asc');
      }
    },
    [sortBy],
  );

  const sortedItems = useMemo(() => {
    const selectedColumn = columns.find((col) => col.id === sortBy);

    // Se non c'è una colonna selezionata o manca il sortAccessor, ritorniamo gli items originali
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

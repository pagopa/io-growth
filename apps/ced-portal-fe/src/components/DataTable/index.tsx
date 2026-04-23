import { useTheme } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { TableGrid } from './components/TableGrid';
import type { DataTableProps, SortDirection } from './types';
import { DataTableLoading } from './components/DataTableLoadingState';
import { DataTableErrorState } from './components/DataTableErrorState';
import { DataTableEmptyState } from './components/DataTableEmptyState';

export function DataTable<T>({
  columns,
  items,
  getRowKey,
  rowAction,
  hideWhenEmpty = false,
  isLoading = false,
  isError = false,
  onRetry,
  emptyMessage = 'Non ci sono elementi da mostrare',
  sx,
}: DataTableProps<T>): JSX.Element | null {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedItems = useMemo(() => {
    const col = columns.find((c) => c.id === sortBy);
    if (!col?.sortAccessor) return items;

    return [...items].sort((a, b) => {
      const left = col.sortAccessor!(a);
      const right = col.sortAccessor!(b);
      const result =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right), 'it', {
              sensitivity: 'base',
            });
      return sortDirection === 'asc' ? result : -result;
    });
  }, [items, sortBy, sortDirection, columns]);

  const handleSort = useCallback(
    (columnId: string, sortable?: boolean) => {
      if (!sortable) return;
      if (sortBy === columnId) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(columnId);
        setSortDirection('asc');
      }
    },
    [sortBy],
  );

  if (hideWhenEmpty && items.length === 0) return null;

  const gridSx = [
    {
      borderRadius: 2.5,
      border: '8px solid',
      borderColor: theme.palette.divider,
      bgcolor: 'common.white',
    },
    ...(Array.isArray(sx) ? sx : [sx]),
  ] as const;

  if (isLoading) return <DataTableLoading />;

  if (isError) return <DataTableErrorState onRetry={onRetry} />;

  if (items.length === 0) return <DataTableEmptyState message={emptyMessage} />;

  return (
    <TableGrid
      columns={columns}
      sortedItems={sortedItems}
      getRowKey={getRowKey}
      rowAction={rowAction}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={handleSort}
      sx={gridSx}
    />
  );
}

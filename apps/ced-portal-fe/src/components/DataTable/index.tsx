import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { TableGrid } from './TableGrid';
import type { DataTableProps, SortDirection } from './types';

function LoadingState() {
  return (
    <Stack
      spacing={1.5}
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      minHeight={127}
    >
      <CircularProgress size={28} />
      <Typography
        sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
      >
        Caricamento...
      </Typography>
    </Stack>
  );
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <Stack
      spacing={1.5}
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      <WarningAmberRoundedIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
      <Typography
        sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
      >
        Errore durante il caricamento
      </Typography>
      {onRetry && (
        <Button variant="text" onClick={onRetry}>
          Riprova
        </Button>
      )}
    </Stack>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Stack spacing={1} alignItems="center" textAlign="center">
      <WarningAmberRoundedIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
      <Typography
        sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
      >
        {message}
      </Typography>
    </Stack>
  );
}

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

  const paperSx = [
    {
      borderRadius: 2.5,
      border: '8px solid',
      borderColor: theme.palette.divider,
      bgcolor: 'common.white',
    },
    ...(Array.isArray(sx) ? sx : [sx]),
  ] as const;

  const StatePaper = ({ children }: { children: ReactNode }) => (
    <Paper
      elevation={0}
      sx={[...paperSx, { display: 'grid', placeItems: 'center', py: 2 }]}
    >
      {children}
    </Paper>
  );

  if (isLoading)
    return (
      <StatePaper>
        <LoadingState />
      </StatePaper>
    );
  if (isError)
    return (
      <StatePaper>
        <ErrorState onRetry={onRetry} />
      </StatePaper>
    );
  if (items.length === 0)
    return (
      <StatePaper>
        <EmptyState message={emptyMessage} />
      </StatePaper>
    );

  return (
    <TableGrid
      columns={columns}
      sortedItems={sortedItems}
      getRowKey={getRowKey}
      rowAction={rowAction}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={handleSort}
      sx={paperSx}
    />
  );
}

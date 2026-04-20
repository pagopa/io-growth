import SouthRoundedIcon from '@mui/icons-material/SouthRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
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

  const hasData = !isLoading && !isError && items.length > 0;

  const content = isLoading ? (
    <LoadingState />
  ) : isError ? (
    <ErrorState onRetry={onRetry} />
  ) : items.length === 0 ? (
    <EmptyState message={emptyMessage} />
  ) : (
    <TableContainer>
      <Table
        size="small"
        sx={{
          borderCollapse: 'separate',
          borderSpacing: 0,
          '& .MuiTableCell-root': { borderBottom: 'none' },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              bgcolor: theme.palette.divider,
              height: 48,
              '& .MuiTableCell-root': {
                bgcolor: theme.palette.divider,
                fontWeight: 700,
                fontSize: 16,
                py: 1.8,
              },
            }}
          >
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align}
                width={col.width}
                sortDirection={sortBy === col.id ? sortDirection : false}
                onClick={() => handleSort(col.id, col.sortable)}
                sx={{
                  ...(col.hideBreakpoint
                    ? { display: col.hideBreakpoint }
                    : {}),
                  ...(col.sortable
                    ? { cursor: 'pointer', userSelect: 'none' }
                    : {}),
                }}
              >
                {col.sortable ? (
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <span>{col.label}</span>
                    <SouthRoundedIcon
                      sx={{
                        fontSize: 18,
                        transform:
                          sortBy === col.id && sortDirection === 'asc'
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </Stack>
                ) : (
                  col.label
                )}
              </TableCell>
            ))}
            {rowAction && <TableCell width={rowAction.width ?? 48} />}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item, index) => (
            <TableRow
              key={getRowKey(item)}
              sx={{
                bgcolor: theme.palette.background.paper,
                height: 48,
                '& .MuiTableCell-root': {
                  bgcolor: theme.palette.background.paper,
                  py: 1.65,
                  fontSize: 16,
                  color: theme.palette.text.primary,
                  ...(index > 0
                    ? { borderTop: `1px solid ${theme.palette.divider}` }
                    : {}),
                },
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  width={col.width}
                  sx={
                    col.hideBreakpoint
                      ? { display: col.hideBreakpoint }
                      : undefined
                  }
                >
                  {col.renderCell(item)}
                </TableCell>
              ))}
              {rowAction && (
                <TableCell>{rowAction.renderAction(item)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Paper
      elevation={0}
      sx={[
        {
          borderRadius: 2.5,
          border: '8px solid',
          borderColor: theme.palette.divider,
          bgcolor: 'common.white',
          display: hasData ? 'block' : 'grid',
          placeItems: hasData ? 'normal' : 'center',
          py: hasData ? 0 : 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {content}
    </Paper>
  );
}

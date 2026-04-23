import SouthRoundedIcon from '@mui/icons-material/SouthRounded';
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type {
  DataTableColumn,
  DataTableRowAction,
  SortDirection,
} from './types';

interface TableGridProps<T> {
  columns: DataTableColumn<T>[];
  sortedItems: T[];
  getRowKey: (item: T) => string;
  rowAction?: DataTableRowAction<T>;
  sortBy: string;
  sortDirection: SortDirection;
  onSort: (columnId: string, sortable?: boolean) => void;
  sx: SxProps<Theme>;
}

export function TableGrid<T>({
  columns,
  sortedItems,
  getRowKey,
  rowAction,
  sortBy,
  sortDirection,
  onSort,
  sx,
}: TableGridProps<T>) {
  const theme = useTheme();

  return (
    <Paper elevation={0} sx={sx}>
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
                  onClick={() => onSort(col.id, col.sortable)}
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
    </Paper>
  );
}

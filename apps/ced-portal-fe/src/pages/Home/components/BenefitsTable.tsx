import SouthRoundedIcon from '@mui/icons-material/SouthRounded';
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import type { Benefit } from '../../../features/benefits/types';
import { benefitsTableColumns } from './BenefitsTable.config';

interface BenefitsTableProps {
  items: Benefit[];
}

export const BenefitsTable = ({ items }: BenefitsTableProps) => {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedItems = useMemo(() => {
    const selectedColumn = benefitsTableColumns.find(
      (col) => col.id === sortBy,
    );
    if (!selectedColumn?.sortAccessor) {
      return items;
    }

    return [...items].sort((a, b) => {
      const left = selectedColumn.sortAccessor!(a);
      const right = selectedColumn.sortAccessor!(b);

      const compareResult =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right), 'it', {
              sensitivity: 'base',
            });

      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [items, sortBy, sortDirection]);

  const handleSort = useCallback(
    (columnId: string, isSortable?: boolean) => {
      if (!isSortable) {
        return;
      }

      if (sortBy === columnId) {
        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
        return;
      }

      setSortBy(columnId);
      setSortDirection('asc');
    },
    [sortBy],
  );

  const renderTableHead = useMemo(
    () => (
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
          {benefitsTableColumns.map((column) => (
            <TableCell
              key={column.id}
              align={column.align}
              width={column.width}
              sortDirection={sortBy === column.id ? sortDirection : false}
              onClick={() => handleSort(column.id, column.sortable)}
              sx={
                column.sortable
                  ? {
                      cursor: 'pointer',
                      userSelect: 'none',
                    }
                  : undefined
              }
            >
              {column.sortable ? (
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <span>{column.label}</span>
                  <SouthRoundedIcon
                    sx={{
                      fontSize: 18,
                      transform:
                        sortBy === column.id && sortDirection === 'asc'
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </Stack>
              ) : (
                column.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    ),
    [sortBy, sortDirection, theme, handleSort],
  );

  const renderTableRow = (item: Benefit, index: number) => (
    <TableRow
      key={`${item.name}-${item.created_by}`}
      sx={{
        bgcolor: theme.palette.background.paper,
        height: 48,
        '& .MuiTableCell-root': {
          bgcolor: theme.palette.background.paper,
          py: 1.65,
          fontSize: 16,
          color: '#232323',
        },
        ...(index > 0 && {
          '& .MuiTableCell-root': {
            borderTop: '1px solid #d8dde4',
          },
        }),
      }}
    >
      {benefitsTableColumns.map((column) => (
        <TableCell key={column.id} align={column.align} width={column.width}>
          {column.renderCell(item, theme)}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <TableContainer sx={{ width: '100%' }}>
      <Table
        size="small"
        sx={{
          borderCollapse: 'separate',
          borderSpacing: 0,
          '& .MuiTableCell-root': {
            borderBottom: 'none',
          },
        }}
      >
        {renderTableHead}
        <TableBody>
          {sortedItems.map((item, index) => renderTableRow(item, index))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

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
import { useMemo, useState } from 'react';
import { useTableSort } from '../../../hooks/useTableSort';
import { ActionsMenu } from './ActionsMenu';
import { benefitsTableColumns } from './BenefitsTable.config';
import type {
  OpportunitySummaryItem,
  OpportunitySummaryItemStatus,
} from '../../../core/api/generated/model';

interface BenefitsTableProps {
  items: OpportunitySummaryItem[];
  onDeleteOpportunity: (
    id: string,
    payload?: { reason: string; date: string },
  ) => void;
}

export const BenefitsTable = ({
  items,
  onDeleteOpportunity,
}: BenefitsTableProps) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemStatus, setSelectedItemStatus] =
    useState<OpportunitySummaryItemStatus | null>(null);

  const { sortedItems, sortBy, sortDirection, handleSort } = useTableSort({
    items,
    columns: benefitsTableColumns,
    defaultSortBy: 'createdAt',
    defaultSortDirection: 'desc',
  });

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    itemId: string,
    itemStatus: OpportunitySummaryItemStatus,
  ) => {
    setSelectedItemId(itemId);
    setSelectedItemStatus(itemStatus);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

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

  const renderTableRow = (item: OpportunitySummaryItem, index: number) => (
    <TableRow
      key={item.id}
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
          {column.renderCell(item, theme, handleMenuOpen)}
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
      <ActionsMenu
        anchor={menuAnchor}
        selectedItemId={selectedItemId}
        selectedItemStatus={selectedItemStatus}
        handleMenuClose={handleMenuClose}
        onDeleteOpportunity={onDeleteOpportunity}
      />
    </TableContainer>
  );
};

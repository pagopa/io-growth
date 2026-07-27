import {
  Checkbox,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  useTheme,
  CircularProgress,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { useCallback, useMemo, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import type { Opportunity } from '../../../features/opportunities/types';
import { APP_ROUTES } from '../../../app/routeConfig';
import { emptyValue } from './constants';
import { OpportunityRow } from './OpportunityRow';

type SortDirection = 'asc' | 'desc';

interface OpportunitiesTableProps {
  items: Opportunity[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selected: Set<string>;
  onSelectChange: (selected: Set<string>) => void;
  onPublish: (id: string) => void;
  onSuspend: (item: Opportunity) => void;
  onCancelSuspension: (id: string) => void;
  activeTab: number;
}

export const OpportunitiesTable = ({
  items,
  isLoading,
  isError,
  onRetry,
  selected,
  onSelectChange,
  onPublish,
  onSuspend,
  onCancelSuspension,
  activeTab,
}: OpportunitiesTableProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuItemId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuItemId(null);
  };

  const handleView = () => {
    if (menuItemId) {
      navigate(generatePath(APP_ROUTES.OPPORTUNITY_DETAIL, { id: menuItemId }));
    }
    handleMenuClose();
  };

  const handlePublish = () => {
    if (menuItemId) {
      onPublish(menuItemId);
    }
    handleMenuClose();
  };

  const menuItem = useMemo(
    () => items.find((item) => item.id === menuItemId),
    [items, menuItemId],
  );

  const menuItemStatus = menuItem?.status;
  const menuItemSuspendFrom = menuItem?.suspendFrom;
  const hasScheduledSuspension =
    menuItemStatus === 'scheduled_suspension' ||
    (menuItemStatus === 'published' && Boolean(menuItemSuspendFrom));

  const canPublish = menuItemStatus === 'test_pending';
  const canSuspend = menuItemStatus === 'published' && !hasScheduledSuspension;

  const handleSuspend = () => {
    if (menuItem) {
      onSuspend(menuItem);
    }
    handleMenuClose();
  };

  const handleCancelSuspension = () => {
    if (menuItemId) {
      onCancelSuspension(menuItemId);
    }
    handleMenuClose();
  };

  const handleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(column);
        setSortDirection('asc');
      }
    },
    [sortBy],
  );

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aVal = a[sortBy as keyof Opportunity] ?? '';
      const bVal = b[sortBy as keyof Opportunity] ?? '';
      const result = String(aVal).localeCompare(String(bVal), 'it', {
        sensitivity: 'base',
      });
      return sortDirection === 'asc' ? result : -result;
    });
  }, [items, sortBy, sortDirection]);

  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0 && selected.size < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectChange(new Set());
    } else {
      onSelectChange(new Set(items.map((item) => item.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectChange(next);
  };

  const paperSx = {
    borderRadius: 2.5,
    border: '8px solid',
    borderColor: theme.palette.divider,
    bgcolor: 'common.white',
    minHeight: 164,
  };

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{ ...paperSx, display: 'grid', placeItems: 'center' }}
      >
        <Stack spacing={1} alignItems="center" textAlign="center">
          <CircularProgress size={28} />
          <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
            Caricamento opportunità...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper
        elevation={0}
        sx={{ ...paperSx, display: 'grid', placeItems: 'center' }}
      >
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <WarningAmberRoundedIcon
            sx={{ color: 'text.secondary', fontSize: 28 }}
          />
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
          >
            Errore durante il caricamento
          </Typography>
          <Button variant="text" onClick={onRetry}>
            Riprova
          </Button>
        </Stack>
      </Paper>
    );
  }

  if (items.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ ...paperSx, display: 'grid', placeItems: 'center' }}
      >
        <Stack spacing={1} alignItems="center" textAlign="center">
          <CheckCircleRounded sx={{ color: 'text.secondary', fontSize: 28 }} />
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
          >
            {emptyValue[activeTab].title}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {emptyValue[activeTab].description}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={paperSx}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={someSelected}
                checked={allSelected}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'name'}
                direction={sortBy === 'name' ? sortDirection : 'asc'}
                onClick={() => handleSort('name')}
              >
                Nome
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'operatorName'}
                direction={sortBy === 'operatorName' ? sortDirection : 'asc'}
                onClick={() => handleSort('operatorName')}
              >
                Ente
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'dateFrom'}
                direction={sortBy === 'dateFrom' ? sortDirection : 'asc'}
                onClick={() => handleSort('dateFrom')}
              >
                Creato il
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'status'}
                direction={sortBy === 'status' ? sortDirection : 'asc'}
                onClick={() => handleSort('status')}
              >
                Stato
              </TableSortLabel>
            </TableCell>
            <TableCell width={48} />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item) => (
            <OpportunityRow
              key={item.id}
              item={item}
              selected={selected.has(item.id)}
              onSelect={handleSelectRow}
              onMenuOpen={handleMenuOpen}
            />
          ))}
        </TableBody>
      </Table>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>Visualizza</MenuItem>
        {canPublish && (
          <MenuItem onClick={handlePublish}>Pubblica su IO</MenuItem>
        )}
        {canSuspend && <MenuItem onClick={handleSuspend}>Sospendi</MenuItem>}
        {hasScheduledSuspension && (
          <MenuItem onClick={handleCancelSuspension}>
            Annulla sospensione programmata
          </MenuItem>
        )}
      </Menu>
    </TableContainer>
  );
};

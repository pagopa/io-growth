import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Checkbox,
  Chip,
  IconButton,
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
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Opportunity } from '../../../features/opportunities/types';

type SortDirection = 'asc' | 'desc';

const STATE_LABELS: Record<string, string> = {
  Da_gestire: 'Da gestire',
  In_attesa_di_modifiche: 'In attesa di modifiche',
  Approvata: 'Approvata',
  Non_attiva: 'Non attiva',
};

const STATE_COLORS: Record<
  string,
  'default' | 'warning' | 'success' | 'info' | 'error'
> = {
  Da_gestire: 'warning',
  In_attesa_di_modifiche: 'info',
  Approvata: 'success',
  Non_attiva: 'default',
};

interface OpportunitiesTableProps {
  items: Opportunity[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selected: Set<string>;
  onSelectChange: (selected: Set<string>) => void;
  onPublish: (id: string) => void;
}

export const OpportunitiesTable = ({
  items,
  isLoading,
  isError,
  onRetry,
  selected,
  onSelectChange,
  onPublish,
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
      navigate(`/opportunita/${menuItemId}`);
    }
    handleMenuClose();
  };

  const handlePublish = () => {
    if (menuItemId) {
      onPublish(menuItemId);
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
          <WarningAmberRoundedIcon
            sx={{ color: 'text.secondary', fontSize: 28 }}
          />
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
          >
            Non ci sono opportunità da mostrare
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
            <TableCell>Ente</TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'created_at'}
                direction={sortBy === 'created_at' ? sortDirection : 'asc'}
                onClick={() => handleSort('created_at')}
              >
                Creato il
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'state'}
                direction={sortBy === 'state' ? sortDirection : 'asc'}
                onClick={() => handleSort('state')}
              >
                Stato
              </TableSortLabel>
            </TableCell>
            <TableCell width={48} />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.has(item.id)}
                  onChange={() => handleSelectRow(item.id)}
                />
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.organization_name}</TableCell>
              <TableCell>
                {new Date(item.created_at).toLocaleDateString('it-IT')}
              </TableCell>
              <TableCell>
                <Chip
                  label={STATE_LABELS[item.state] ?? item.state}
                  color={STATE_COLORS[item.state] ?? 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, item.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>Visualizza</MenuItem>
        <MenuItem onClick={handlePublish}>Pubblica su IO</MenuItem>
      </Menu>
    </TableContainer>
  );
};

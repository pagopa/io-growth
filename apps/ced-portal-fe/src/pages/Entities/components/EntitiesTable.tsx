import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import {
  ENTITY_STATE_COLORS,
  ENTITY_STATE_OPTIONS,
} from '../../../constants/opportunityState';
import type {
  EntityItem,
  EntityRequestItem,
  ManagedEntityItem,
} from '../../../features/entities/types.js';

type SortDirection = 'asc' | 'desc';

interface EntitiesTableProps {
  activeTab: number;
  items: EntityItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const isRequestItem = (item: EntityItem): item is EntityRequestItem =>
  item.tab === 'requests';

const isManagedEntityItem = (item: EntityItem): item is ManagedEntityItem =>
  item.tab === 'entities';

export const EntitiesTable = ({
  activeTab,
  items,
  isLoading,
  isError,
  onRetry,
}: EntitiesTableProps) => {
  const theme = useTheme();

  const paperSx = {
    borderRadius: 2.5,
    border: '8px solid',
    borderColor: theme.palette.divider,
    bgcolor: 'common.white',
    minHeight: 164,
  };
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(column);
        setSortDirection('asc');
      }
    },
    [sortBy],
  );

  const sortedItems = useMemo(() => {
    const valueForSort = (item: EntityItem) => {
      if (sortBy === 'opportunities_count' && isManagedEntityItem(item)) {
        return item.opportunities_count;
      }

      return item[sortBy as keyof EntityItem] ?? '';
    };

    return [...items].sort((left, right) => {
      const leftValue = valueForSort(left);
      const rightValue = valueForSort(right);

      const result =
        typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue), 'it', {
              sensitivity: 'base',
            });

      return sortDirection === 'asc' ? result : -result;
    });
  }, [items, sortBy, sortDirection]);

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{ ...paperSx, display: 'grid', placeItems: 'center' }}
      >
        <Stack spacing={1} alignItems="center" textAlign="center">
          <CircularProgress size={28} />
          <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
            Caricamento enti...
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
            Non ci sono enti da mostrare
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
            <TableCell
              sortDirection={sortBy === 'name' ? sortDirection : false}
            >
              <TableSortLabel
                active={sortBy === 'name'}
                direction={sortDirection}
                onClick={() => handleSort('name')}
              >
                Ente
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={sortBy === 'city' ? sortDirection : false}
            >
              <TableSortLabel
                active={sortBy === 'city'}
                direction={sortDirection}
                onClick={() => handleSort('city')}
              >
                Città
              </TableSortLabel>
            </TableCell>
            {activeTab === 0 ? (
              <TableCell
                sortDirection={sortBy === 'created_at' ? sortDirection : false}
              >
                <TableSortLabel
                  active={sortBy === 'created_at'}
                  direction={sortDirection}
                  onClick={() => handleSort('created_at')}
                >
                  Creata il
                </TableSortLabel>
              </TableCell>
            ) : (
              <>
                <TableCell
                  sortDirection={
                    sortBy === 'opportunities_count' ? sortDirection : false
                  }
                >
                  <TableSortLabel
                    active={sortBy === 'opportunities_count'}
                    direction={sortDirection}
                    onClick={() => handleSort('opportunities_count')}
                  >
                    Opportunità
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={
                    sortBy === 'active_from' ? sortDirection : false
                  }
                >
                  <TableSortLabel
                    active={sortBy === 'active_from'}
                    direction={sortDirection}
                    onClick={() => handleSort('active_from')}
                  >
                    Attivo dal
                  </TableSortLabel>
                </TableCell>
              </>
            )}
            <TableCell
              sortDirection={sortBy === 'state' ? sortDirection : false}
            >
              <TableSortLabel
                active={sortBy === 'state'}
                direction={sortDirection}
                onClick={() => handleSort('state')}
              >
                Stato
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" sx={{ width: 56 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.city}</TableCell>
              {isRequestItem(item) ? (
                <TableCell>{item.created_at}</TableCell>
              ) : (
                <>
                  <TableCell>{item.opportunities_count}</TableCell>
                  <TableCell>{item.active_from}</TableCell>
                </>
              )}
              <TableCell>
                <Chip
                  label={
                    ENTITY_STATE_OPTIONS.find((o) => o.value === item.state)
                      ?.label ?? item.state
                  }
                  color={ENTITY_STATE_COLORS[item.state] ?? 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <IconButton size="small">
                  <ChevronRightRoundedIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

import {
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
import { APP_ROUTES } from '../../../app/routeConfig';
import { emptyValue } from './constants';
import { PlaceListItem } from '../../../generated/model';
import { PlaceRow } from './LocationRow';
import { useToast } from '../../../contexts';
import { useDeletePlaceMutation } from '../../../features/places/api';
import { DeletePlaceModal } from './DeletePlaceModal';

type SortDirection = 'asc' | 'desc';

interface LocationsTableProps {
  items: PlaceListItem[];
  isLoading: boolean;
  isError: boolean;
  activeTab: number;
  onRetry: () => void;
}

export const LocationsTable = ({
  items,
  isLoading,
  isError,
  activeTab,
  onRetry,
}: LocationsTableProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);

  const { showToast } = useToast();
  const [deletePlace, { isLoading: isDeleting }] = useDeletePlaceMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      setMenuAnchor(event.currentTarget);
      setMenuItemId(id);
    },
    [],
  );

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setMenuItemId(null);
  }, []);

  const handleView = useCallback(() => {
    if (menuItemId) {
      navigate(generatePath(APP_ROUTES.LOCATION_DETAIL, { id: menuItemId }));
    }
    handleMenuClose();
  }, [menuItemId, navigate, handleMenuClose]);

  const handleDeleteClick = useCallback(() => {
    setDeleteModalOpen(true);
    setMenuAnchor(null); // Close menu visually but keep menuItemId for deletion
  }, []);

  const confirmDelete = useCallback(async () => {
    console.log('🚀 ~ confirmDelete ~ menuItemId:', menuItemId);
    if (!menuItemId) return;
    try {
      await deletePlace(menuItemId).unwrap();
      showToast('Punto di accesso eliminato con successo', 'success');
      setDeleteModalOpen(false);
      setMenuItemId(null);
    } catch {
      showToast("Errore durante l'eliminazione", 'error');
    }
  }, [menuItemId, deletePlace, showToast]);

  const selectedPlace = useMemo(
    () => items.find((item) => item.id === menuItemId),
    [items, menuItemId],
  );

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
      const aVal = a[sortBy as keyof PlaceListItem] ?? '';
      const bVal = b[sortBy as keyof PlaceListItem] ?? '';
      const result = String(aVal).localeCompare(String(bVal), 'it', {
        sensitivity: 'base',
      });
      return sortDirection === 'asc' ? result : -result;
    });
  }, [items, sortBy, sortDirection]);

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
          <Button
            variant="text"
            onClick={() => navigate(APP_ROUTES.CREATE_LOCATION)}
          >
            Aggiungi nuovo
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={paperSx}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'name'}
                direction={sortBy === 'name' ? sortDirection : 'asc'}
                onClick={() => handleSort('name')}
              >
                Nome
              </TableSortLabel>
            </TableCell>
            <TableCell>Indirizzo</TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'associatedOpportunities'}
                direction={
                  sortBy === 'associatedOpportunities' ? sortDirection : 'asc'
                }
                onClick={() => handleSort('associatedOpportunities')}
              >
                Opportunità associate
              </TableSortLabel>
            </TableCell>
            <TableCell width={48} />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedItems.map((item) => (
            <PlaceRow key={item.id} item={item} onMenuOpen={handleMenuOpen} />
          ))}
        </TableBody>
      </Table>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>Dettagli</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Elimina</MenuItem>
      </Menu>

      <DeletePlaceModal
        open={deleteModalOpen}
        isDeleting={isDeleting}
        locationName={selectedPlace?.name ?? ''}
        onClose={() => {
          setDeleteModalOpen(false);
          setMenuItemId(null);
        }}
        onConfirm={confirmDelete}
      />
    </TableContainer>
  );
};

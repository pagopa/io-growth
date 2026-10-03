import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  SyntheticEvent,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { AppTextField, PageTabs, ResultsPagination } from '../../components';
import type { OpportunityFilters } from '../../features/opportunities/types';
import { useToast } from '../../contexts';
import { useMemorizedTabsAndFilters } from '../../hooks/useMemorizedTabsAndFilters';
import { PlaceBaseType } from '../../generated/model';
import { usePlacesData } from '../../features/places/hooks';
import { LocationsTable } from './components/LocationsTable';
type PlacesFilter = {
  search: string;
};

const INITIAL_FILTERS: PlacesFilter = {
  search: '',
};

export default function LocationsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { tab, page, limit, filters, updateParams } =
    useMemorizedTabsAndFilters<PlacesFilter>(INITIAL_FILTERS, 10);
  const [draftFilters, setDraftFilters] = useState<PlacesFilter>(filters);

  const { items, total, isLoading, isError, refetch } = usePlacesData({
    ...filters,
    tab,
    page,
    limit,
  });

  // Sync draft filters when active filters change (e.g. from URL)
  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const handleTabChange = useCallback(
    (_event: SyntheticEvent, newValue: number) => {
      updateParams({
        tab: newValue,
        page: 1,
        search: draftFilters.search, // Apply the drafted search when tab changes
      });
    },
    [updateParams, draftFilters],
  );

  const handleFilterChange = useCallback((partial: Partial<PlacesFilter>) => {
    setDraftFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleFilter = useCallback(() => {
    updateParams({
      search: draftFilters.search,
      page: 1,
    });
  }, [draftFilters.search, updateParams]);

  const handleReset = useCallback(() => {
    setDraftFilters((prev) => ({ ...prev, search: '' }));
    updateParams({ search: '', page: 1 });
  }, [updateParams]);

  const handleChangeLimit = useCallback(
    (newLimit: number) => {
      updateParams({ limit: newLimit, page: 1 });
    },
    [updateParams],
  );

  const handleChangePage = useCallback(
    (newPage: number) => updateParams({ page: newPage }),
    [updateParams],
  );

  return (
    <Box
      sx={{
        minHeight: '100%',
        px: { xs: 2, md: 3.5 },
        py: { xs: 3, md: 4.5 },
      }}
      bgcolor={theme.palette.common.neutralGray}
    >
      <Stack spacing={3} sx={{ minHeight: '100%' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{ fontSize: { xs: 36, md: 44 }, fontWeight: 700 }}
            >
              Punti di accesso
            </Typography>
            <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 18 }}>
              Aggiungi e gestisci le sedi fisiche e i siti web dove offri le tue
              opportunità
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate(APP_ROUTES.CREATE_LOCATION)}
            sx={{
              borderRadius: 2,
              px: 3,
              fontSize: 16,
              fontWeight: 700,
              alignSelf: { xs: 'stretch', md: 'auto' },
            }}
          >
            Aggiungi punto di accesso
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          sx={{ width: '100%' }}
        >
          <AppTextField
            fullWidth
            placeholder={'cerca per nome'}
            value={draftFilters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            sx={{ flex: 1, minWidth: 0 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Stack
            direction="row"
            spacing={2.5}
            alignItems="center"
            sx={{ pl: { lg: 1 } }}
          >
            <Button
              variant="text"
              startIcon={<FilterAltOutlinedIcon />}
              onClick={handleFilter}
              sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}
            >
              Filtra
            </Button>
            <Button
              variant="text"
              onClick={handleReset}
              sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}
            >
              Rimuovi filtri
            </Button>
          </Stack>
        </Stack>

        <Box>
          <PageTabs
            activeTab={tab}
            tabLabels={['Tutti', 'Sedi', 'Siti web']}
            onChange={handleTabChange}
          />
          <Box sx={{ mt: 2 }}>
            <LocationsTable
              activeTab={tab}
              items={items}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            />
          </Box>
          {total > 0 && (
            <ResultsPagination
              totalItems={total}
              page={page}
              rowsPerPage={limit}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeLimit}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
}

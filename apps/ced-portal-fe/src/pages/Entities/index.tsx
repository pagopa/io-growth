import { Box, Stack, Typography, useTheme } from '@mui/material';
import type { SyntheticEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { FiltersBar, PageTabs, ResultsPagination } from '../../components';
import {
  ENTITY_MANAGED_STATE_OPTIONS,
  ENTITY_REQUEST_STATE_OPTIONS,
} from '../../constants/opportunityState';
import { useEntitiesData } from '../../features/entities/hooks.js';
import type {
  EntityFilters,
  EntityItem,
} from '../../features/entities/types.js';
import { EntitiesTable } from './components/EntitiesTable.js';

const INITIAL_FILTERS: EntityFilters = {
  search: '',
  state: '',
};

export default function EntitiesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EntityFilters>(INITIAL_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<EntityFilters>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { items, total, isLoading, isError } = useEntitiesData({
    activeTab,
    filters,
    page,
    rowsPerPage,
  });

  const isRequestsTab = activeTab === 0;

  const displayedItems = useMemo(
    () =>
      items.filter((item) =>
        isRequestsTab ? item.tab === 'requests' : item.tab === 'entities',
      ),
    [isRequestsTab, items],
  );

  const stateOptions = isRequestsTab
    ? ENTITY_REQUEST_STATE_OPTIONS
    : ENTITY_MANAGED_STATE_OPTIONS;

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
    setDraftFilters(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
  };

  const handleFilterChange = (
    partial: Partial<{ search: string; state: string }>,
  ) => {
    setDraftFilters((current) => ({
      ...current,
      ...(partial.search === undefined ? {} : { search: partial.search }),
      ...(partial.state === undefined
        ? {}
        : { state: partial.state as EntityFilters['state'] }),
    }));
  };

  const handleFilter = () => {
    setFilters(draftFilters);
    setPage(1);
  };

  const handleReset = () => {
    setDraftFilters(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handleOpenDetail = (item: EntityItem) => {
    navigate(`${APP_ROUTES.ENTITIES}/${item.id}`);
  };

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
        <Box>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: 36, md: 44 }, fontWeight: 700 }}
          >
            Enti
          </Typography>
          <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 18 }}>
            Gestisci le nuove richieste di convenzionamento e monitora lo stato
            degli enti.
          </Typography>
        </Box>

        <FiltersBar
          filters={draftFilters}
          onChange={handleFilterChange}
          onFilter={handleFilter}
          onReset={handleReset}
          searchPlaceholder="Cerca per ente"
          stateOptions={stateOptions}
        />

        <Stack spacing={0} sx={{ width: '100%' }}>
          <PageTabs
            activeTab={activeTab}
            onChange={handleTabChange}
            tabLabels={['Da gestire', 'Enti']}
          />
          <EntitiesTable
            activeTab={activeTab}
            items={displayedItems}
            isLoading={isLoading}
            isError={isError}
            onRowOpen={handleOpenDetail}
          />
          <ResultsPagination
            totalItems={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

import { Box, Stack, Typography, useTheme } from '@mui/material';
import type { SyntheticEvent } from 'react';
import { useMemo, useState } from 'react';
import { FiltersBar, PageTabs, ResultsPagination } from '../../components';
import { useEntitiesData } from '../../features/entities/hooks.js';
import type { EntityFilters } from '../../features/entities/types.js';
import { EntitiesTable } from './components/EntitiesTable.js';

const INITIAL_FILTERS: EntityFilters = {
  search: '',
  state: '',
};

const REQUEST_STATE_OPTIONS = [
  { value: 'Da_gestire', label: 'Da gestire' },
  { value: 'Rifiutata', label: 'Rifiutata' },
];

const ENTITY_STATE_OPTIONS = [
  { value: 'Attivo', label: 'Attivo' },
  { value: 'Inattivo', label: 'Inattivo' },
  { value: 'Cessato', label: 'Cessato' },
];

export default function EntitiesPage() {
  const theme = useTheme();
  const [filters, setFilters] = useState<EntityFilters>(INITIAL_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<EntityFilters>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { requestItems, entityItems, isLoading, isError, refetch } =
    useEntitiesData(filters);

  const displayedItems = useMemo(
    () => (activeTab === 0 ? requestItems : entityItems),
    [activeTab, entityItems, requestItems],
  );

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return displayedItems.slice(start, start + rowsPerPage);
  }, [displayedItems, page, rowsPerPage]);

  const stateOptions =
    activeTab === 0 ? REQUEST_STATE_OPTIONS : ENTITY_STATE_OPTIONS;

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
    setDraftFilters(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
  };

  const handleFilterChange = (partial: Partial<EntityFilters>) => {
    setDraftFilters((current) => ({ ...current, ...partial }));
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
            tabLabels={['Richieste', 'Enti']}
          />
          <EntitiesTable
            activeTab={activeTab}
            items={paginatedItems}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
          />
          <ResultsPagination
            totalItems={displayedItems.length}
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

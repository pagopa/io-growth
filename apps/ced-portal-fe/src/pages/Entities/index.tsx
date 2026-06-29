import { Box, Stack, Typography, useTheme } from '@mui/material';
import type { SyntheticEvent } from 'react';
import { useMemo, useState, useEffect } from 'react';
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
import type { ListOnboardingsStatusesItem } from '../../core/api/generated/model/listOnboardingsStatusesItem.js';
import { useMemorizedTabsAndFilters } from '../../hooks/useMemorizedTabsAndFilters.js';

const INITIAL_FILTERS: EntityFilters = {
  search: '',
  state: '',
};

export default function EntitiesPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { tab, page, limit, filters, updateParams } =
    useMemorizedTabsAndFilters<EntityFilters>(INITIAL_FILTERS, 5);

  const [draftFilters, setDraftFilters] = useState<EntityFilters>(filters);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const { items, total, isLoading, isError, refetch } = useEntitiesData({
    activeTab: tab,
    filters,
    page,
    rowsPerPage: limit,
  });

  const isRequestsTab = tab === 0;

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
    updateParams({
      tab: newValue,
      page: 1,
      search: '',
      state: '',
    });
  };

  const handleFilterChange = (
    partial: Partial<{ search: string; state: ListOnboardingsStatusesItem }>,
  ) => {
    setDraftFilters((current) => ({ ...current, ...partial }));
  };

  const handleFilter = () => {
    updateParams({
      search: draftFilters.search,
      state: draftFilters.state,
      page: 1,
    });
  };

  const handleReset = () => {
    updateParams({ search: '', state: '', page: 1 });
  };

  const handleOpenDetail = (item: EntityItem) => {
    navigate(`${APP_ROUTES.ENTITIES}/${item.id}`);
  };

  return (
    <Box
      sx={{ minHeight: '100%', px: { xs: 2, md: 3.5 }, py: { xs: 3, md: 4.5 } }}
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
          onChange={({ state, search }) =>
            handleFilterChange({
              search,
              state: state as ListOnboardingsStatusesItem,
            })
          }
          onFilter={handleFilter}
          onReset={handleReset}
          searchPlaceholder="Cerca per ente"
          stateOptions={stateOptions}
        />

        <Stack spacing={0} sx={{ width: '100%' }}>
          <PageTabs
            activeTab={tab}
            onChange={handleTabChange}
            tabLabels={['Da gestire', 'Enti']}
          />
          <EntitiesTable
            activeTab={tab}
            items={displayedItems}
            onRetry={refetch}
            isLoading={isLoading}
            isError={isError}
            onRowOpen={handleOpenDetail}
          />
          <ResultsPagination
            totalItems={total}
            page={page}
            rowsPerPage={limit}
            onPageChange={(newPage) => updateParams({ page: newPage })}
            onRowsPerPageChange={(newLimit) =>
              updateParams({ limit: newLimit, page: 1 })
            }
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

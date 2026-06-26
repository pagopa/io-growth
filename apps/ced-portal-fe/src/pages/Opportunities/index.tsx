import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FiltersBar, PageTabs, ResultsPagination } from '../../components';
import { useApproveOpportunityMutation } from '../../features/opportunities/api';
import { useOpportunitiesData } from '../../features/opportunities/hooks';
import type { OpportunityFilters } from '../../features/opportunities/types';
import { PublishModal } from '../../components/PublishModal';
import { OpportunitiesTable } from './components/OpportunitiesTable';
import { useToast } from '../../contexts';
import {
  ADMIN_APPROVED_STATE_OPTIONS,
  ADMIN_NOT_ACTIVE_STATE_OPTIONS,
  ADMIN_REQUEST_STATE_OPTIONS,
} from '../../constants';

import { useMemorizedTabsAndFilters } from '../../hooks/useMemorizedTabsAndFilters';

const INITIAL_FILTERS: OpportunityFilters = {
  search: '',
  state: '',
};

export default function OpportunitiesPage() {
  const theme = useTheme();
  const { showToast } = useToast();

  const { tab, page, limit, filters, updateParams } =
    useMemorizedTabsAndFilters<OpportunityFilters>(INITIAL_FILTERS, 10);

  const [draftFilters, setDraftFilters] = useState<OpportunityFilters>(filters);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishCount, setPublishCount] = useState(0);
  const [idsToPublish, setIdsToPublish] = useState<string[]>([]);

  const [approveOpportunity, { isLoading: isApproving }] =
    useApproveOpportunityMutation();

  useEffect(() => {
    setSelected(new Set());
  }, [tab, filters]);

  const {
    newItems,
    approvedItems,
    inactiveItems,
    isLoading,
    isError,
    refetch,
  } = useOpportunitiesData(filters);

  const displayedItems = useMemo(() => {
    if (tab === 0) return newItems;
    if (tab === 1) return approvedItems;
    return inactiveItems;
  }, [tab, newItems, approvedItems, inactiveItems]);

  const filteredDisplayedItems = useMemo(() => {
    if (tab === 0) return ADMIN_REQUEST_STATE_OPTIONS;
    if (tab === 1) return ADMIN_APPROVED_STATE_OPTIONS;
    return ADMIN_NOT_ACTIVE_STATE_OPTIONS;
  }, [tab]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * limit;
    return displayedItems.slice(start, start + limit);
  }, [displayedItems, page, limit]);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const handleTabChange = useCallback(
    (_event: SyntheticEvent, newValue: number) => {
      updateParams({
        tab: newValue,
        page: 1,
        search: undefined,
        state: undefined,
      });
    },
    [updateParams],
  );

  const handleFilterChange = useCallback(
    (partial: Partial<OpportunityFilters>) => {
      setDraftFilters((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const handleFilter = useCallback(() => {
    updateParams({
      search: draftFilters.search,
      state: draftFilters.state,
      page: 1,
    });
  }, [draftFilters.search, draftFilters.state, updateParams]);

  const handleReset = useCallback(() => {
    updateParams({ search: undefined, state: undefined, page: 1 });
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

  const handlePublish = useCallback(async () => {
    if (idsToPublish.length === 0 || isApproving) {
      return;
    }

    try {
      await Promise.all(
        idsToPublish.map((id) => {
          const opportunity = displayedItems.find((item) => item.id === id);

          return approveOpportunity({
            id,
            payload: opportunity?.dateFrom
              ? { dateFrom: opportunity.dateFrom }
              : undefined,
          }).unwrap();
        }),
      );

      setPublishModalOpen(false);
      setSelected(new Set());
      setIdsToPublish([]);
      showToast('Opportunità approvata con successo', 'success');
    } catch {
      showToast("Errore durante l'approvazione dell'opportunità", 'error');
    }
  }, [
    idsToPublish,
    isApproving,
    showToast,
    displayedItems,
    approveOpportunity,
  ]);

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
              Opportunità
            </Typography>
            <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 18 }}>
              Visualizza tutte le opportunità create dagli enti e gestisci le
              nuove proposte.
            </Typography>
          </Box>
          {selected.size > 0 && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                setIdsToPublish(Array.from(selected));
                setPublishCount(selected.size);
                setPublishModalOpen(true);
              }}
              sx={{
                borderRadius: 2,
                px: 3,
                fontSize: 16,
                fontWeight: 700,
                alignSelf: { xs: 'stretch', md: 'auto' },
                whiteSpace: 'nowrap',
              }}
            >
              Pubblica su IO ({selected.size})
            </Button>
          )}
        </Stack>

        <FiltersBar
          filters={draftFilters}
          onChange={handleFilterChange}
          onFilter={handleFilter}
          onReset={handleReset}
          stateOptions={filteredDisplayedItems}
        />

        <Box>
          <PageTabs activeTab={tab} onChange={handleTabChange} />
          <Box sx={{ mt: 2 }}>
            <OpportunitiesTable
              activeTab={tab}
              items={paginatedItems}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              selected={selected}
              onSelectChange={setSelected}
              onPublish={(id) => {
                setIdsToPublish([id]);
                setPublishCount(1);
                setPublishModalOpen(true);
              }}
            />
          </Box>
          {displayedItems.length > 0 && (
            <ResultsPagination
              totalItems={displayedItems.length}
              page={page}
              rowsPerPage={limit}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeLimit}
            />
          )}
        </Box>
      </Stack>

      <PublishModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={handlePublish}
        count={publishCount}
        publishDate={
          displayedItems.find((item) => idsToPublish.includes(item.id))
            ?.dateFrom
        }
      />
    </Box>
  );
}

import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { SyntheticEvent, useMemo, useState } from 'react';
import { useOpportunitiesData } from '../../features/opportunities/hooks';
import type { OpportunityFilters } from '../../features/opportunities/types';
import { PublishModal } from '../../components/PublishModal';
import { OpportunitiesFiltersBar } from './components/OpportunitiesFiltersBar';
import { OpportunitiesTabs } from './components/OpportunitiesTabs';
import { OpportunitiesTable } from './components/OpportunitiesTable';
import { OpportunitiesPagination } from './components/OpportunitiesPagination';
import { useToast } from '../../contexts';

const INITIAL_FILTERS: OpportunityFilters = {
  search: '',
  state: '',
};

export default function OpportunitiesPage() {
  const theme = useTheme();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<OpportunityFilters>(INITIAL_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<OpportunityFilters>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishCount, setPublishCount] = useState(0);

  const {
    newItems,
    approvedItems,
    inactiveItems,
    isLoading,
    isError,
    refetch,
  } = useOpportunitiesData(filters);

  const displayedItems = useMemo(() => {
    if (activeTab === 0) return newItems;
    if (activeTab === 1) return approvedItems;
    return inactiveItems;
  }, [activeTab, newItems, approvedItems, inactiveItems]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return displayedItems.slice(start, start + rowsPerPage);
  }, [displayedItems, page, rowsPerPage]);

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
    setSelected(new Set());
  };

  const handleFilterChange = (partial: Partial<OpportunityFilters>) =>
    setDraftFilters((prev) => ({ ...prev, ...partial }));

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

        <OpportunitiesFiltersBar
          filters={draftFilters}
          onChange={handleFilterChange}
          onFilter={handleFilter}
          onReset={handleReset}
        />

        <Box>
          <OpportunitiesTabs activeTab={activeTab} onChange={handleTabChange} />
          <Box sx={{ mt: 2 }}>
            <OpportunitiesTable
              items={paginatedItems}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              selected={selected}
              onSelectChange={setSelected}
              onPublish={() => {
                setPublishCount(1);
                setPublishModalOpen(true);
              }}
            />
          </Box>
          {displayedItems.length > 0 && (
            <OpportunitiesPagination
              totalItems={displayedItems.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          )}
        </Box>
      </Stack>

      <PublishModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={() => {
          setPublishModalOpen(false);
          setSelected(new Set());
          showToast('Fatto!', 'success');
        }}
        count={publishCount}
      />
    </Box>
  );
}

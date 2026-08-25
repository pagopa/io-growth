import { Box, Stack, useTheme } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { ResultsPagination } from '../../components';
import {
  useGetOpportunityCategoriesQuery,
  useDeleteOpportunityMutation,
  useOperatorCancelScheduledSuspensionMutation,
  useOperatorSuspendOpportunityMutation,
} from '../../features/opportunities/api';
import { useBenefitsData } from '../../features/opportunities/hooks';
import { useToast } from '../../contexts';
import { BenefitsContentState } from './components/BenefitsContentState';
import { BenefitsFiltersBar } from './components/BenefitsFiltersBar';
import { BenefitsTabs } from './components/BenefitsTabs';
import { MainContentHeader } from './components/MainContentHeader';
import type {
  ListOperatorOpportunitiesStatus,
  OperatorDeleteOpportunityBody,
} from '../../core/api/generated/model';
import { useMemorizedTabsAndFilters } from '../../hooks/useMemorizedTabsAndFilters';
import {
  OPERATOR_MANAGED_STATE_OPTIONS,
  OPERATOR_REQUEST_STATE_OPTIONS,
} from '../../constants';
import type { SuspendOpportunityPayload } from '../../features/opportunities/types';

const INITIAL_FILTERS = {
  search: '',
  categoryId: '',
  status: '' as ListOperatorOpportunitiesStatus | '',
};

export const MainContent = () => {
  const theme = useTheme();
  const { showToast } = useToast();

  const { tab, page, limit, filters, updateParams } =
    useMemorizedTabsAndFilters<typeof INITIAL_FILTERS>(INITIAL_FILTERS, 20);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [categoryIdInput, setCategoryIdInput] = useState(filters.categoryId);
  const [statusInput, setStatusInput] = useState<
    ListOperatorOpportunitiesStatus | ''
  >(filters.status);

  useEffect(() => {
    setSearchInput(filters.search);
    setCategoryIdInput(filters.categoryId);
    setStatusInput(filters.status);
  }, [filters]);

  const { data: categories = [] } = useGetOpportunityCategoriesQuery();

  const {
    inManagementItems,
    approvedItems,
    isLoading,
    isError,
    refetch,
    total,
  } = useBenefitsData({
    categoryId: filters.categoryId || undefined,
    search: filters.search || undefined,
    status: filters.status || undefined,
    offset: (page - 1) * limit,
    limit: limit,
  });

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    updateParams({ tab: newValue, page: 1 });
  };

  const handleFilter = () => {
    updateParams({
      search: searchInput,
      categoryId: categoryIdInput,
      status: statusInput,
      page: 1,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    setCategoryIdInput('');
    setStatusInput('');
    updateParams({ search: '', categoryId: '', status: '', page: 0 });
  };

  const [deleteOpportunity] = useDeleteOpportunityMutation();
  const [suspendOpportunity] = useOperatorSuspendOpportunityMutation();
  const [cancelScheduledSuspension] =
    useOperatorCancelScheduledSuspensionMutation();

  const handleDeleteOpportunity = async (
    id: string,
    payload?: OperatorDeleteOpportunityBody,
  ) => {
    try {
      await deleteOpportunity({ id, payload }).unwrap();
      showToast('Opportunità cancellata con successo', 'success');
      refetch();
    } catch {
      showToast("Errore durante l'eliminazione dell'opportunità", 'error');
    }
  };

  const handleSuspendOpportunity = async (
    id: string,
    payload: SuspendOpportunityPayload,
  ) => {
    try {
      await suspendOpportunity({ id, payload }).unwrap();
      showToast('Sospensione impostata con successo', 'success');
      refetch();
    } catch {
      showToast("Errore durante la sospensione dell'opportunita", 'error');
    }
  };

  const handleCancelScheduledSuspension = async (id: string) => {
    try {
      await cancelScheduledSuspension({ id }).unwrap();
      showToast('Sospensione pianificata annullata con successo', 'success');
      refetch();
    } catch {
      showToast(
        "Errore durante l'annullamento della sospensione pianificata",
        'error',
      );
    }
  };

  const displayedItems = tab === 0 ? inManagementItems : approvedItems;
  const filterForDisplayedItems =
    tab === 0 ? OPERATOR_REQUEST_STATE_OPTIONS : OPERATOR_MANAGED_STATE_OPTIONS;
  const showPagination = !isLoading && !isError && displayedItems.length > 0;

  return (
    <Box
      sx={{ minHeight: '100%', px: { xs: 2, md: 3.5 }, py: { xs: 3, md: 4.5 } }}
      bgcolor={theme.palette.common.neutralGray}
    >
      <Stack spacing={3} sx={{ minHeight: '100%' }}>
        <MainContentHeader />
        <BenefitsFiltersBar
          search={searchInput}
          onSearchChange={setSearchInput}
          categoryId={categoryIdInput}
          categoryOptions={categories}
          onCategoryChange={setCategoryIdInput}
          status={statusInput}
          stateOptions={filterForDisplayedItems}
          onStatusChange={setStatusInput}
          onFilter={handleFilter}
          onReset={handleReset}
        />

        <Box>
          <BenefitsTabs activeTab={tab} onChange={handleTabChange} />
          <BenefitsContentState
            isLoading={isLoading}
            isError={isError}
            items={displayedItems}
            activeTab={tab}
            onRetry={refetch}
            onDeleteOpportunity={handleDeleteOpportunity}
            onSuspendOpportunity={handleSuspendOpportunity}
            onCancelScheduledSuspension={handleCancelScheduledSuspension}
          />
          {showPagination ? (
            <Box sx={{ px: { xs: 1, md: 0 }, pt: 2 }}>
              <ResultsPagination
                totalItems={total}
                page={page}
                rowsPerPage={limit}
                rowsPerPageOptions={[10, 20, 50]}
                onPageChange={(newPage) => updateParams({ page: newPage - 1 })}
                onRowsPerPageChange={(rows) =>
                  updateParams({ limit: rows, page: 0 })
                }
              />
            </Box>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
};

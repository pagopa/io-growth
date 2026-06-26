import { Box, Stack, useTheme } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { ResultsPagination } from '../../components';
import { useGetOpportunityCategoriesQuery } from '../../features/opportunities/api';
import { useBenefitsData } from '../../features/opportunities/hooks';
import { useDebounce } from '../../hooks/useDebounce';
import { BenefitsContentState } from './components/BenefitsContentState';
import { BenefitsFiltersBar } from './components/BenefitsFiltersBar';
import { BenefitsTabs } from './components/BenefitsTabs';
import { MainContentHeader } from './components/MainContentHeader';
import { OpportunitySummaryItemStatus } from '../../core/api/generated/model';
import {
  OPERATOR_MANAGED_STATE_OPTIONS,
  OPERATOR_REQUEST_STATE_OPTIONS,
} from '../../constants';

const DEFAULT_ROWS_PER_PAGE = 20;

export const MainContent = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [categoryIdInput, setCategoryIdInput] = useState('');
  const [statusInput, setStatusInput] = useState<
    OpportunitySummaryItemStatus | ''
  >('');

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<OpportunitySummaryItemStatus | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const debouncedSearch = useDebounce(search, 500);
  const { data: categories = [] } = useGetOpportunityCategoriesQuery();

  const {
    inManagementItems,
    approvedItems,
    isLoading,
    isError,
    refetch,
    total,
  } = useBenefitsData({
    categoryId: categoryId || undefined,
    search: debouncedSearch || undefined,
    status: status || undefined,
    offset: page * rowsPerPage,
    limit: rowsPerPage,
  });

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleSearchChange = (value: string) => setSearchInput(value);
  const handleStatusChange = (value: OpportunitySummaryItemStatus | '') =>
    setStatusInput(value);
  const handleCategoryChange = (value: string) => setCategoryIdInput(value);

  const handleFilter = () => {
    setSearch(searchInput);
    setCategoryId(categoryIdInput);
    setStatus(statusInput);
    setPage(0);
  };

  // OnReset: reset filters inputs
  const handleReset = () => {
    setSearchInput('');
    setCategoryIdInput('');
    setStatusInput('');
    setSearch('');
    setCategoryId('');
    setStatus('');
    setPage(0);
  };

  const displayedItems = activeTab === 0 ? inManagementItems : approvedItems;
  const filterForDisplayedItems =
    activeTab === 0
      ? OPERATOR_REQUEST_STATE_OPTIONS
      : OPERATOR_MANAGED_STATE_OPTIONS;
  const showPagination = !isLoading && !isError && displayedItems.length > 0;

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
        <MainContentHeader />
        <BenefitsFiltersBar
          search={searchInput}
          onSearchChange={handleSearchChange}
          categoryId={categoryIdInput}
          categoryOptions={categories}
          onCategoryChange={handleCategoryChange}
          status={statusInput}
          stateOptions={filterForDisplayedItems}
          onStatusChange={handleStatusChange}
          onFilter={handleFilter}
          onReset={handleReset}
        />

        <Box>
          <BenefitsTabs activeTab={activeTab} onChange={handleTabChange} />
          <BenefitsContentState
            isLoading={isLoading}
            isError={isError}
            items={displayedItems}
            activeTab={activeTab}
            onRetry={refetch}
          />
          {showPagination ? (
            <Box sx={{ px: { xs: 1, md: 0 }, pt: 2 }}>
              <ResultsPagination
                totalItems={total}
                page={page + 1}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 20, 50]}
                onPageChange={(newPage) => setPage(newPage - 1)}
                onRowsPerPageChange={(rows) => {
                  setRowsPerPage(rows);
                  setPage(0);
                }}
              />
            </Box>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
};

import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import { Button, SelectChangeEvent, Stack } from '@mui/material';
import { AppSelect, AppTextField } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  selectBenefitCategoryFilter,
  selectBenefitNameFilter,
  selectBenefitStatusFilter,
} from '../../../features/benefitsFilters/selectors';
import { categoriesOptions, statusOptions } from '../../../constants';
import {
  resetBenefitFilters,
  setBenefitFilters,
} from '../../../features/benefitsFilters/benefitFiltersSlice';
import { useCallback, useState } from 'react';
import {
  BenefitCategory,
  BenefitStatus,
} from '../../../features/benefitsFilters/types';

export const BenefitsFiltersBar = () => {
  const dispatch = useAppDispatch();

  const nameFilter = useAppSelector(selectBenefitNameFilter);
  const categoryFilter = useAppSelector(selectBenefitCategoryFilter);
  const statusFilter = useAppSelector(selectBenefitStatusFilter);

  const [filters, setFilters] = useState({
    name: nameFilter,
    category: categoryFilter,
    status: statusFilter,
  });

  const handleNameFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, name: e.target.value }));
    },
    [],
  );

  const handleCategoryFilterChange = useCallback(
    (e: SelectChangeEvent<string | string[]>) => {
      setFilters((prev) => ({
        ...prev,
        category: e.target.value as BenefitCategory,
      }));
    },
    [],
  );

  const handleStatusFilterChange = useCallback(
    (e: SelectChangeEvent<string | string[]>) => {
      setFilters((prev) => ({
        ...prev,
        status: e.target.value as keyof typeof BenefitStatus,
      }));
    },
    [],
  );

  const handleApplyFilters = useCallback(() => {
    dispatch(setBenefitFilters(filters));
  }, [dispatch, filters]);

  const handleResetFilters = useCallback(() => {
    dispatch(resetBenefitFilters());
    setFilters({ name: null, category: null, status: null });
  }, [dispatch]);

  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', lg: 'center' }}
      sx={{ width: '100%' }}
    >
      <AppTextField
        fullWidth
        placeholder="Cerca per nome"
        value={filters.name || ''}
        onChange={handleNameFilterChange}
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      />

      <AppSelect
        fullWidth
        value={filters.category || ''}
        sx={{ flex: 0.5 }}
        label="Categoria"
        placeholder="Categoria"
        options={categoriesOptions}
        onChange={handleCategoryFilterChange}
      />
      <AppSelect
        value={filters.status || ''}
        fullWidth
        sx={{ flex: 0.5 }}
        label="Stato"
        placeholder="Stato"
        options={statusOptions}
        onChange={handleStatusFilterChange}
      />

      <Stack
        direction="row"
        spacing={2.5}
        alignItems="center"
        sx={{ pl: { lg: 1 } }}
      >
        <Button
          variant="text"
          startIcon={<FilterAltOutlined />}
          sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}
          onClick={handleApplyFilters}
        >
          Filtra
        </Button>
        <Button
          variant="text"
          sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}
          onClick={handleResetFilters}
        >
          Rimuovi filtri
        </Button>
      </Stack>
    </Stack>
  );
};

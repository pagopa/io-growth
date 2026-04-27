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
  setBenefitCategoryFilter,
  setBenefitNameFilter,
  setBenefitStatusFilter,
} from '../../../features/benefitsFilters/benefitFiltersSlice';
import { useCallback } from 'react';
import {
  BenefitCategory,
  BenefitStatus,
} from '../../../features/benefitsFilters/types';

export const BenefitsFiltersBar = () => {
  const dispatch = useAppDispatch();

  const nameFilter = useAppSelector(selectBenefitNameFilter);
  const categoryFilter = useAppSelector(selectBenefitCategoryFilter);
  const statusFilter = useAppSelector(selectBenefitStatusFilter);

  const handleNameFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setBenefitNameFilter(e.target.value));
    },
    [dispatch],
  );

  const handleCategoryFilterChange = useCallback(
    (e: SelectChangeEvent<string | string[]>) => {
      dispatch(setBenefitCategoryFilter(e.target.value as BenefitCategory));
    },
    [dispatch],
  );

  const handleStatusFilterChange = useCallback(
    (e: SelectChangeEvent<string | string[]>) => {
      dispatch(setBenefitStatusFilter(e.target.value as BenefitStatus));
    },
    [dispatch],
  );

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
        value={nameFilter}
        onChange={handleNameFilterChange}
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      />

      <AppSelect
        fullWidth
        value={categoryFilter || undefined}
        sx={{ flex: 0.5 }}
        label="Categoria"
        placeholder="Categoria"
        options={categoriesOptions}
        onChange={handleCategoryFilterChange}
      />
      <AppSelect
        value={statusFilter || undefined}
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
        >
          Filtra
        </Button>
        <Button variant="text" sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}>
          Rimuovi filtri
        </Button>
      </Stack>
    </Stack>
  );
};

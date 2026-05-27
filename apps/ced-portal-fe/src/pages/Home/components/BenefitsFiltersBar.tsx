import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import { Button, SelectChangeEvent, Stack } from '@mui/material';
import { AppSelect, AppTextField } from '../../../components';
import { OPPORTUNITY_STATUS_OPTIONS } from '../../../constants';
import { useCallback } from 'react';
import type { OpportunityStatus } from '../../../features/benefits/types';

interface BenefitsFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  categoryOptions: Array<{ value: string; label: string }>;
  onCategoryChange: (value: string) => void;
  status: OpportunityStatus | '';
  onStatusChange: (value: OpportunityStatus | '') => void;
  onFilter: () => void;
  onReset: () => void;
}

export const BenefitsFiltersBar = ({
  search,
  onSearchChange,
  categoryId,
  categoryOptions,
  onCategoryChange,
  status,
  onStatusChange,
  onFilter,
  onReset,
}: BenefitsFiltersBarProps) => {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange],
  );

  const handleCategoryChange = useCallback(
    (e: SelectChangeEvent<string | string[]>) => {
      onCategoryChange(e.target.value as string);
    },
    [onCategoryChange],
  );

  const handleStatusChange = useCallback(
    (e: SelectChangeEvent<string | string[]>) => {
      onStatusChange(e.target.value as OpportunityStatus | '');
    },
    [onStatusChange],
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
        value={search}
        onChange={handleSearchChange}
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      />

      <AppSelect
        fullWidth
        value={categoryId}
        sx={{ flex: 0.5 }}
        label="Categoria"
        placeholder="Categoria"
        options={categoryOptions}
        onChange={handleCategoryChange}
      />

      <AppSelect
        value={status}
        fullWidth
        sx={{ flex: 0.5 }}
        label="Stato"
        placeholder="Stato"
        options={OPPORTUNITY_STATUS_OPTIONS}
        onChange={handleStatusChange}
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
          onClick={onFilter}
        >
          Filtra
        </Button>
        <Button
          variant="text"
          sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}
          onClick={onReset}
        >
          Rimuovi filtri
        </Button>
      </Stack>
    </Stack>
  );
};

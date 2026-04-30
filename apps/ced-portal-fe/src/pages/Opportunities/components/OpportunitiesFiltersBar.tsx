import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import { Button, Stack } from '@mui/material';
import { AppSelect, AppTextField } from '../../../components';
import { STATE_OPTIONS } from '../../../constants';
import type { OpportunityFilters } from '../../../features/opportunities/types';

interface OpportunitiesFiltersBarProps {
  filters: OpportunityFilters;
  onChange: (filters: Partial<OpportunityFilters>) => void;
  onFilter: () => void;
  onReset: () => void;
}

export const OpportunitiesFiltersBar = ({
  filters,
  onChange,
  onFilter,
  onReset,
}: OpportunitiesFiltersBarProps) => (
  <Stack
    direction={{ xs: 'column', lg: 'row' }}
    spacing={2}
    alignItems={{ xs: 'stretch', lg: 'center' }}
    sx={{ width: '100%' }}
  >
    <AppTextField
      fullWidth
      placeholder="Cerca per ente o opportunità"
      value={filters.search}
      onChange={(e) => onChange({ search: e.target.value })}
      sx={{ flex: 1, minWidth: 0 }}
    />

    <AppSelect
      fullWidth
      sx={{ flex: 0.5 }}
      label="Stato"
      placeholder="Stato"
      options={STATE_OPTIONS}
      value={
        filters.state
          ? (STATE_OPTIONS.find((o) => o.value === filters.state)?.value ??
            filters.state)
          : ''
      }
      onChange={(e) => {
        const label = e.target.value as string;
        const key =
          STATE_OPTIONS.find(({ label: oLabel }) => oLabel === label)?.value ??
          '';
        onChange({ state: key });
      }}
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
        onClick={onFilter}
        sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}
      >
        Filtra
      </Button>
      <Button
        variant="text"
        onClick={onReset}
        sx={{ fontWeight: 700, fontSize: 16, px: 0.5 }}
      >
        Rimuovi filtri
      </Button>
    </Stack>
  </Stack>
);

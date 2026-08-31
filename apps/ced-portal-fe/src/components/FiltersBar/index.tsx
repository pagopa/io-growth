import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import { Button, Stack } from '@mui/material';
import { AppSelect } from '../Select';
import { AppTextField } from '../TextField';

interface SearchStateFilters {
  search: string;
  state: string;
}

interface FiltersBarProps {
  filters: SearchStateFilters;
  onChange: (filters: Partial<SearchStateFilters>) => void;
  onFilter: () => void;
  onReset: () => void;
  searchPlaceholder?: string;
  stateOptions?: Array<{ value: string; label: string }>;
}

export const FiltersBar = ({
  filters,
  onChange,
  onFilter,
  onReset,
  searchPlaceholder = 'Cerca per ente o opportunità',
  stateOptions = [],
}: FiltersBarProps) => (
  <Stack
    direction={{ xs: 'column', lg: 'row' }}
    spacing={2}
    alignItems={{ xs: 'stretch', lg: 'center' }}
    sx={{ width: '100%' }}
  >
    <AppTextField
      fullWidth
      placeholder={searchPlaceholder}
      value={filters.search}
      onChange={(e) => onChange({ search: e.target.value })}
      sx={{ flex: 1, minWidth: 0 }}
    />

    <AppSelect
      fullWidth
      sx={{ flex: 0.5 }}
      label="Stato"
      placeholder="Stato"
      options={stateOptions}
      value={filters.state}
      onChange={(e) => onChange({ state: e.target.value as string })}
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

import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import { Button, Stack } from '@mui/material';
import { AppSelect, AppTextField } from '../../../components';

interface BenefitsFiltersBarProps {
  statusOptions: string[];
}

export function BenefitsFiltersBar({ statusOptions }: BenefitsFiltersBarProps) {
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
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      />

      <AppSelect
        fullWidth
        sx={{ flex: 0.5 }}
        label="Categoria"
        placeholder="Categoria"
        options={statusOptions}
      />
      <AppSelect
        fullWidth
        sx={{ flex: 0.5 }}
        label="Stato"
        placeholder="Stato"
        options={statusOptions}
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
}

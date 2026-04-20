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
    >
      <AppTextField
        fullWidth
        placeholder="Cerca per nome"
        sx={{
          maxWidth: 550,
        }}
      />

      <AppSelect label="Categoria" placeholder="Categoria" options={statusOptions} />
      <AppSelect label="Stato" placeholder="Stato" options={statusOptions} />

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

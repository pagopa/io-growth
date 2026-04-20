import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo } from 'react';
import type { Benefit } from '../../../features/benefits/types';
import { BenefitsTable } from './BenefitsTable';

interface BenefitsContentStateProps {
  isLoading: boolean;
  isError: boolean;
  items: Benefit[];
  activeTab: number;
  onRetry: () => void;
}

const IN_MANAGEMENT_STATES = new Set([
  'Revisione',
  'Bozza',
  'Modifiche_Richieste',
]);
const APPROVED_STATES = new Set(['Pubblicata', 'Pubblicazione_Programmata']);

export function BenefitsContentState({
  isLoading,
  isError,
  items,
  activeTab,
  onRetry,
}: BenefitsContentStateProps) {
  const theme = useTheme();
  const filteredItems = useMemo(() => {
    if (activeTab === 0) {
      return items.filter((item) => IN_MANAGEMENT_STATES.has(item.state));
    }
    return items.filter((item) => APPROVED_STATES.has(item.state));
  }, [activeTab, items]);
  const hasData = !isLoading && !isError && filteredItems.length > 0;

  const renderContent = () => {
    if (isLoading)
      return (
        <Stack spacing={1} alignItems="center" textAlign="center">
          <CircularProgress size={28} />
          <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
            Caricamento agevolazioni...
          </Typography>
        </Stack>
      );
    if (isError)
      return (
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <WarningAmberRoundedIcon
            sx={{ color: 'text.secondary', fontSize: 28 }}
          />
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: 'text.secondary',
            }}
          >
            Errore durante il caricamento
          </Typography>
          <Button variant="text" onClick={onRetry}>
            Riprova
          </Button>
        </Stack>
      );
    if (filteredItems.length === 0)
      return (
        <Stack spacing={1} alignItems="center" textAlign="center">
          <WarningAmberRoundedIcon
            sx={{ color: 'text.secondary', fontSize: 28 }}
          />
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: 'text.secondary',
            }}
          >
            Non ci sono elementi da mostrare
          </Typography>
          <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
            {activeTab === 0
              ? 'Qui vedrai le agevolazioni in gestione.'
              : 'Qui vedrai le agevolazioni approvate.'}
          </Typography>
        </Stack>
      );
    return <BenefitsTable items={filteredItems} />;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        borderRadius: 2.5,
        border: '8px solid',
        borderColor: theme.palette.divider,
        bgcolor: 'common.white',
        minHeight: 164,
        display: hasData ? 'block' : 'grid',
        placeItems: hasData ? 'normal' : 'center',
      }}
    >
      {renderContent()}
    </Paper>
  );
}

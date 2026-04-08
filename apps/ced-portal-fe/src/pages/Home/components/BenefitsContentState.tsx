import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import type { Benefit } from '../../../features/benefits/types';
import { BenefitsTable } from './BenefitsTable';

interface BenefitsContentStateProps {
  isLoading: boolean;
  isError: boolean;
  items: Benefit[];
  activeTab: number;
  onRetry: () => void;
}

export function BenefitsContentState({
  isLoading,
  isError,
  items,
  activeTab,
  onRetry,
}: BenefitsContentStateProps) {
  const theme = useTheme();
  const hasData = !isLoading && !isError && items.length > 0;

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
      {isLoading ? (
        <Stack spacing={1} alignItems="center" textAlign="center">
          <CircularProgress size={28} />
          <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
            Caricamento agevolazioni...
          </Typography>
        </Stack>
      ) : isError ? (
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
      ) : items.length === 0 ? (
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
      ) : (
        <BenefitsTable items={items} />
      )}
    </Paper>
  );
}

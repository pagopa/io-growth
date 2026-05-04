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
    if (items.length === 0)
      return (
        <Stack spacing={1} alignItems="center" textAlign="center" py={2}>
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
    return <BenefitsTable items={items} />;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        borderRadius: 2.5,
        border: '8px solid',
        borderColor: theme.palette.divider,
        display: hasData ? 'block' : 'grid',
        placeItems: hasData ? 'normal' : 'center',
      }}
    >
      {renderContent()}
    </Paper>
  );
}

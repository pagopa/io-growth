import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { StatePaper } from './StatePaper';

export const DataTableErrorState = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <StatePaper>
      <Stack
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
        textAlign="center"
      >
        <WarningAmberRoundedIcon
          sx={{ color: 'text.secondary', fontSize: 28 }}
        />
        <Typography
          sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
        >
          Errore durante il caricamento
        </Typography>
        {onRetry && (
          <Button variant="text" onClick={onRetry}>
            Riprova
          </Button>
        )}
      </Stack>
    </StatePaper>
  );
};

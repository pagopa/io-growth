import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { StatePaper } from './StatePaper';

export const DataTableEmptyState = ({ message }: { message: string }) => {
  return (
    <StatePaper>
      <Stack spacing={1} alignItems="center" textAlign="center">
        <WarningAmberRoundedIcon
          sx={{ color: 'text.secondary', fontSize: 28 }}
        />
        <Typography
          sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
        >
          {message}
        </Typography>
      </Stack>
    </StatePaper>
  );
};

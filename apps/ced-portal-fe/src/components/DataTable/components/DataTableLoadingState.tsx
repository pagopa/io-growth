import { CircularProgress, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { StatePaper } from './StatePaper';

export const DataTableLoading = () => {
  return (
    <StatePaper>
      <Stack
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        minHeight={127}
      >
        <CircularProgress size={28} />
        <Typography
          sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
        >
          Caricamento...
        </Typography>
      </Stack>
    </StatePaper>
  );
};

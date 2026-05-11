import { Box, CircularProgress, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type Props<T> = {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
  errorMessage?: string;
  children: (data: T) => ReactNode;
};

export function QueryGuard<T>({
  isLoading,
  isError,
  data,
  errorMessage = 'Impossibile caricare i dati.',
  children,
}: Props<T>) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || data === undefined) {
    return (
      <Box sx={{ px: 2, pt: 4 }}>
        <Typography color="error">{errorMessage}</Typography>
      </Box>
    );
  }

  return children(data);
}

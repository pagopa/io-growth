import { Box, CircularProgress, Typography } from '@mui/material';
import { ErrorBody } from '@pagopa/io-core-ui';
import type { ReactNode } from 'react';
import ErrorScreen from './ErrorScreen';
import { PageErrorType } from './ErrorScreen/types';

type Props<T> = {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
  error?: unknown;
  /**
   * @deprecated use errorType and create a custom error screen instead
   *
   */
  errorMessage?: string;
  children: (data: T) => ReactNode;
  errorType?: PageErrorType;
  reloadAction?: () => void;
};

export function QueryGuard<T>({
  isLoading,
  isError,
  data,
  errorMessage = 'Impossibile caricare i dati.',
  error,
  children,
  errorType,
  reloadAction,
}: Readonly<Props<T>>) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || data === undefined) {
    if (errorType) {
      return <ErrorScreen errorType={errorType} reloadAction={reloadAction} />;
    }

    return (
      <Box sx={{ px: 2, pt: 4 }}>
        <ErrorBody fontWeight="Semibold">{errorMessage}</ErrorBody>
        {error !== undefined && (
          <Typography
            color="error"
            variant="caption"
            component="pre"
            sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          >
            {JSON.stringify(error, null, 2)}
          </Typography>
        )}
      </Box>
    );
  }

  return children(data);
}

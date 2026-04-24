import { Paper, useTheme } from '@mui/material';
import { ReactNode } from 'react';

export const StatePaper = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={[
        {
          display: 'grid',
          placeItems: 'center',
          py: 2,
          borderRadius: 2.5,
          border: '8px solid',
          borderColor: theme.palette.divider,
          bgcolor: 'common.white',
        },
      ]}
    >
      {children}
    </Paper>
  );
};

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function SectionTitle({
  label,
  action,
}: {
  label: string;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mx: 3,
        pt: 1,
      }}
    >
      <Typography
        component="p"
        sx={{
          color: 'text.secondary',
          fontSize: 14,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      {action}
    </Box>
  );
}

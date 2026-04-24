import type { ReactNode } from 'react';
import { Paper } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

type SectionCardProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export function SectionCard({ children, sx }: SectionCardProps) {
  return (
    <Paper
      elevation={0}
      sx={[
        {
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Paper>
  );
}

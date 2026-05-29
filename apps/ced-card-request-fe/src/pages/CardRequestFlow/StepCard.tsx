import { Box, type SxProps, type Theme } from '@mui/material';

export function StepCard({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={{ borderRadius: 3, bgcolor: 'background.paper', p: 3, pb: 4, ...sx }}
    >
      {children}
    </Box>
  );
}

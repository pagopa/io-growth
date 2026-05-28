import { Box } from '@mui/material';

export function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ borderRadius: 3, bgcolor: 'background.paper', p: 3, pb: 4 }}>
      {children}
    </Box>
  );
}

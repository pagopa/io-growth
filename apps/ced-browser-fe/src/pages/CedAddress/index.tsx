import { Box, useTheme } from '@mui/material';

export default function CedAddressPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: theme.palette.common.neutralGray,
      }}
    />
  );
}

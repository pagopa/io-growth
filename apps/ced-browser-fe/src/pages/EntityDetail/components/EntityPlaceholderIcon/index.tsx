import { AccountBalanceOutlined } from '@mui/icons-material';
import { Box, useTheme } from '@mui/material';

export function EntityPlaceholderIcon() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: 66,
        height: 66,
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: theme.palette.common.neutralGray,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AccountBalanceOutlined
        sx={{
          fontSize: 42,
          color: theme.palette.common.decorativeIcon,
        }}
      />
    </Box>
  );
}

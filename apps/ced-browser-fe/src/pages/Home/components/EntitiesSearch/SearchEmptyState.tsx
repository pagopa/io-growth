import { Box, Typography, useTheme } from '@mui/material';
import { IllusMIError } from '@pagopa/mui-italia';

export function SearchEmptyState() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        mt: '100px',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <IllusMIError />
        <Typography
          variant="h1"
          component="h1"
          sx={{
            mt: '28px',
            color: theme.palette.common.neutral900,
            fontSize: 28,
          }}
        >
          Qui non c&apos;è nulla!
        </Typography>
        <Typography
          sx={{
            color: theme.palette.common.neutral500,
            fontSize: 17,
            lineHeight: 1.35,
            fontWeight: 400,
            maxWidth: 272,
            mx: 'auto',
          }}
        >
          Prova a cercare una città, una struttura o un ente.
        </Typography>
      </Box>
    </Box>
  );
}

import { Box, Typography, useTheme } from '@mui/material';
import { IllusMIIdea } from '@pagopa/mui-italia';

export function SearchInitialState() {
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
        <IllusMIIdea />
        <Typography
          variant="h1"
          component="h1"
          sx={{
            mb: 1.5,
            color: theme.palette.common.neutral900,
            fontSize: 28,
          }}
        >
          Inizia a cercare
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

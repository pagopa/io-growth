import { Box, Typography, useTheme } from '@mui/material';

export function SearchEmptyState() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minHeight: 296,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: theme.palette.common.searchDecorativeBlue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 700,
              color: '#0B3EE3',
              lineHeight: 1,
            }}
          >
            !
          </Typography>
        </Box>

        <Typography
          component="h1"
          sx={{
            mb: 1.5,
            color: '#111827',
            fontSize: 26,
            lineHeight: 1.15,
            fontWeight: 700,
          }}
        >
          Qui non c&apos;è nulla!
        </Typography>
        <Typography
          sx={{
            color: '#5F687A',
            fontSize: 17,
            lineHeight: 1.35,
            fontWeight: 400,
            maxWidth: 220,
            mx: 'auto',
          }}
        >
          Prova a cercare una città, una struttura o un ente.
        </Typography>
      </Box>
    </Box>
  );
}

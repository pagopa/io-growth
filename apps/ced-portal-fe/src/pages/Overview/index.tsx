import { Box, Button, Stack, Typography, useTheme } from '@mui/material';

export default function OverviewPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100%',
        px: { xs: 2, md: 3.5 },
        py: { xs: 3, md: 4.5 },
      }}
      bgcolor={theme.palette.common.neutralGray}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: 36, md: 44 }, fontWeight: 700 }}
          >
            Panoramica
          </Typography>
          <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 18 }}>
            Gestisci le informazioni del tuo ente.
          </Typography>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            Completa dati
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

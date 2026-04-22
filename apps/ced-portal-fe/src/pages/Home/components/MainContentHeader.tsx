import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';

export function MainContentHeader() {
  const navigate = useNavigate();

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
    >
      <Box>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: 36, md: 44 }, fontWeight: 700 }}
        >
          Agevolazioni
        </Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 18 }}>
          Crea e gestisci le tue agevolazioni.
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<AddIcon />}
        onClick={() => navigate(APP_ROUTES.AGREEMENT_DETAIL_CREATION)}
        sx={{
          borderRadius: 2,
          px: 3,
          fontSize: 16,
          fontWeight: 700,
          alignSelf: { xs: 'stretch', md: 'auto' },
        }}
      >
        Crea agevolazione
      </Button>
    </Stack>
  );
}

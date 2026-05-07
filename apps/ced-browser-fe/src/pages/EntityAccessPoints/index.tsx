import { ArrowBack } from '@mui/icons-material';
import {
  Box,
  ButtonBase,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DiscoveryListItem } from '../../components/index.js';
import { useGetEntityDetailQuery } from '../../features/entities/api.js';

export default function EntityAccessPointsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetEntityDetailQuery(id ?? '');

  /*
  THIS LOADING AND ERROR IS ONLY TEMPORARY, BECAUSE WE USE MOCKED DATA WITH MOCKOON,
  ** WHEN WE WILL CONNECT THE REAL API WE CAN REMOVE THIS LOADING AND ERROR STATE
  */
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ px: 2, pt: 4 }}>
        <Typography color="error">
          Impossibile caricare i dati dell&apos;ente.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        pb: 'calc(48px + env(safe-area-inset-bottom, 0px))',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 2, pt: 3, pb: 2 }}>
        <ButtonBase
          onClick={() => navigate(-1)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            color: 'text.primary',
            fontSize: 16,
            fontWeight: 600,
            mb: 3,
          }}
        >
          <ArrowBack sx={{ fontSize: 20 }} />
          Indietro
        </ButtonBase>

        <Typography
          component="h1"
          sx={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'text.primary',
          }}
        >
          Tutti i punti di accesso
        </Typography>
        <Typography
          sx={{
            fontSize: 16,
            color: 'text.secondary',
            mt: 0.5,
          }}
        >
          di{' '}
          <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {data.name}
          </Box>
        </Typography>
      </Box>

      <Stack divider={<Divider sx={{ mx: 2 }} />} sx={{ px: 2 }}>
        {data.accessPoints.map((item) => (
          <DiscoveryListItem
            key={item.id}
            variant="simple"
            title={item.title}
            subtitle={item.subtitle}
            sx={{ px: 0, bgcolor: 'background.paper' }}
          />
        ))}
      </Stack>
    </Box>
  );
}

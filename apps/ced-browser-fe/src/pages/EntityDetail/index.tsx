import {
  Box,
  ButtonBase,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEntityDetailQuery } from '../../features/entities/api.js';
import { ItemsSection } from './components/ItemsSection/index.js';
import { ContactsSection } from './components/ContactsSection/index.js';

export default function EntityDetailPage() {
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
          {data.name}
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ mt: 2, mb: 4, px: 2 }}>
        <ItemsSection
          variant="opportunity"
          entityId={id ?? ''}
          items={data.opportunities}
        />
        <ItemsSection
          variant="access-point"
          entityId={id ?? ''}
          items={data.accessPoints}
        />
        <ContactsSection contacts={data.contacts} />
      </Stack>
    </Box>
  );
}

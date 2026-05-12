import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEntityDetailQuery } from '../../features/entities/api.js';
import { ItemsSection } from '../../components/ItemsSection/index.js';
import { ContactsSection } from '../../components/ContactsSection/index.js';
import { QueryGuard } from '../../components/index.js';

export default function EntityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetEntityDetailQuery(id ?? '');

  return (
    <QueryGuard
      isLoading={isLoading}
      isError={isError}
      data={data}
      errorMessage="Impossibile caricare i dati dell'ente."
    >
      {(resolvedData) => (
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
              {resolvedData.name}
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ mt: 2, mb: 4, px: 2 }}>
            <ItemsSection
              variant="opportunity"
              entityId={id ?? ''}
              items={resolvedData.opportunities}
            />
            <ItemsSection
              variant="access-point"
              entityId={id ?? ''}
              items={resolvedData.accessPoints}
            />
            <ContactsSection contacts={resolvedData.contacts} />
          </Stack>
        </Box>
      )}
    </QueryGuard>
  );
}

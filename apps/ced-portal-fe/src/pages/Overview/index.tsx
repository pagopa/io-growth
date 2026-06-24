import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { SectionCard } from '../../components/SectionCard';
import { WarningOutlined } from '@mui/icons-material';
import { useGetOperatorProfileQuery } from '../../features/profile/api';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const hasStatus = (error: unknown, status: number): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as FetchBaseQueryError).status === status
  );
};

export default function OverviewPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetOperatorProfileQuery();

  const isNotFound = hasStatus(error, 404);

  const displayName = data?.displayName;
  const place = data?.place;

  const contacts = place?.supportContacts ?? [];

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
            onClick={() => navigate(APP_ROUTES.OVERVIEW_COMPLETE_DATA)}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            {isNotFound ? 'Completa dati' : 'Modifica dati'}
          </Button>
        </Box>

        {isNotFound && (
          <Alert
            severity="warning"
            icon={
              <WarningOutlined
                sx={{ color: 'theme.palette.common.alertWarningText' }}
              />
            }
          >
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.6,
                color: (theme) => theme.palette.common.alertWarningText,
              }}
            >
              È necessario completare i dati del tuo ente e caricare il logo per
              iniziare a pubblicare opportunità.
            </Typography>
          </Alert>
        )}

        {isLoading && <Typography>Caricamento...</Typography>}

        {data && (
          <SectionCard>
            <Stack>
              <Typography variant="h3" fontSize={20} fontWeight={700} mb={2}>
                Informazioni visibili su IO
              </Typography>

              <Typography fontSize={14} color="text.secondary">
                Queste informazioni vengono usate per identificarti sull’app IO.
              </Typography>

              <Stack mt={2}>
                <Typography variant="overline" color="text.secondary" mb={2}>
                  DATI ENTE
                </Typography>

                {/* DISPLAY NAME */}
                <Typography fontSize={14} color="text.secondary">
                  Nome visibile su IO
                </Typography>

                <Typography fontSize={16} fontWeight={600}>
                  {displayName}
                </Typography>
                <Divider sx={{ my: 1, borderColor: 'divider' }} />

                {/* ONLINE */}
                {place?.type === 'online' && place.website && (
                  <>
                    <Typography fontSize={14} color="text.secondary">
                      Sito web
                    </Typography>

                    <Typography fontSize={16} fontWeight={600}>
                      {place.website.url}
                    </Typography>
                  </>
                )}

                {place?.type === 'offline' && place.address && (
                  <>
                    <Typography fontSize={14} color="text.secondary">
                      Indirizzo
                    </Typography>

                    <Typography fontSize={16} fontWeight={600}>
                      {place.address.street}, {place.address.city} (
                      {place.address.state}) - {place.address.postalCode}
                    </Typography>
                  </>
                )}

                <Typography variant="overline" color="text.secondary" mt={4}>
                  CONTATTI ASSISTENZA
                </Typography>
                {contacts.length > 0 && (
                  <>
                    <Typography fontSize={14} color="text.secondary" mt={2}>
                      Contatti
                    </Typography>

                    {contacts.map((c) => (
                      <>
                        <Typography key={c.id} fontSize={16} fontWeight={600}>
                          {c.type}: {c.value}
                        </Typography>
                        {contacts.length > 1 && (
                          <Divider sx={{ my: 1, borderColor: 'divider' }} />
                        )}
                      </>
                    ))}
                  </>
                )}
              </Stack>
            </Stack>
          </SectionCard>
        )}
      </Stack>
    </Box>
  );
}

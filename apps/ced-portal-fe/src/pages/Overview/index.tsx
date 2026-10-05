import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { MIAlert } from '@pagopa/mui-italia';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { SectionCard } from '../../components/SectionCard';
import { hasStatus } from '../../core/api/baseApi';
import { useGetOperatorProfileQuery } from '../../features/profile/api';
import { useBase64Image } from '../../hooks/useBase64Image';

export default function OverviewPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [logoUnavailable, setLogoUnavailable] = useState(false);
  const [coverUnavailable, setCoverUnavailable] = useState(false);

  const { data, isLoading, error } = useGetOperatorProfileQuery();
  const logo = useBase64Image(
    data?.operatorId
      ? `https://logos.ced.pagopa.it/${encodeURIComponent(data.operatorId)}`
      : undefined,
  );
  const cover = useBase64Image(
    data?.operatorId
      ? `https://images.ced.pagopa.it/${encodeURIComponent(data.operatorId)}`
      : undefined,
  );

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
          <MIAlert severity="warning">
            È necessario completare i dati del tuo ente e caricare il logo per
            iniziare a pubblicare opportunità.
          </MIAlert>
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

                {data.operatorId &&
                  ((logo?.src && !logoUnavailable) ||
                    (cover?.src && !coverUnavailable)) && (
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      sx={{ mt: 3, mb: 1 }}
                    >
                      {logo?.src && !logoUnavailable && (
                        <Stack
                          spacing={1}
                          alignItems="center"
                          justifyContent="center"
                          sx={{
                            flex: 1,
                            aspectRatio: '1.92 / 1',
                            p: 2,
                            bgcolor: 'common.neutralGray',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            component="img"
                            src={logo.src}
                            alt="Logo dell’ente"
                            onError={() => setLogoUnavailable(true)}
                            sx={{
                              width: { xs: 88, sm: 104 },
                              height: { xs: 88, sm: 104 },
                              objectFit: 'contain',
                              borderRadius: 2,
                              bgcolor: 'common.white',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Logo
                          </Typography>
                        </Stack>
                      )}
                      {cover?.src && !coverUnavailable && (
                        <Stack
                          spacing={1}
                          alignItems="center"
                          justifyContent="center"
                          sx={{
                            flex: 1,
                            aspectRatio: '1.92 / 1',
                            p: 2,
                            bgcolor: 'common.neutralGray',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            component="img"
                            src={cover.src}
                            alt="Immagine di copertina dell’ente"
                            onError={() => setCoverUnavailable(true)}
                            sx={{
                              width: { xs: 88, sm: 104 },
                              height: { xs: 88, sm: 104 },
                              objectFit: 'cover',
                              borderRadius: 2,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Copertina
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
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

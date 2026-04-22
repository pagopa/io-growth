import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppRadioGroup,
  AppTextField,
  UploadDropzone,
} from '../../../components';

const SEDE_OPTIONS = [
  { label: 'Sede fisica', value: 'fisica' },
  { label: 'Online', value: 'online' },
];

const OVERLINE_LABEL_SX = {
  color: '#555C70',
  fontFeatureSettings: "'liga' off, 'clig' off",
  fontFamily: 'Titillium Web',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: 'normal',
  textTransform: 'uppercase',
} as const;

export default function OverviewCompleteDataPage() {
  const navigate = useNavigate();
  const [sede, setSede] = useState('fisica');
  const [contacts, setContacts] = useState(['']);
  const [logoFileName, setLogoFileName] = useState<string>();
  const [coverFileName, setCoverFileName] = useState<string>();

  const handleAddContact = () => setContacts((prev) => [...prev, '']);

  return (
    <Box
      sx={{
        bgcolor: 'common.neutralGray',
        color: 'text.primary',
      }}
    >
      <Box component="main" sx={{ py: 3, pb: { xs: 14, md: 16 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 0 } }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ width: 24, height: 24 }} />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 3,
              color: 'common.neutralBlack',
              textTransform: 'none',
              p: 0,
            }}
          >
            Esci
          </Button>

          <Stack spacing={3}>
            {/* Intestazione pagina */}
            <Box>
              <Stack spacing={1}>
                <Typography variant="h6" fontWeight={700}>
                  Completa i dati dell’ente
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Queste informazioni saranno usate per identificarti sull’app
                  IO
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ mt: 3, fontWeight: 600, color: 'error.dark' }}
              >
                * Campo obbligatorio
              </Typography>
            </Box>

            {/* Card principale */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2.5,
                display: 'flex',
                p: 3,
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 3,
                alignSelf: 'stretch',
              }}
            >
              <Typography fontWeight={700}>
                Informazioni visibili sull’app IO
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Completa o modifica le informazioni del tuo ente.{' '}
              </Typography>
              <Stack spacing={3} sx={{ width: '100%' }}>
                {/* Sub-card con bordo grigio */}
                <Paper
                  variant="outlined"
                  sx={{ borderRadius: 2, p: { xs: 1.5, md: 2 }, width: '100%' }}
                >
                  {/* Sezione: Dati dell'ente */}
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <StorefrontOutlinedIcon
                        sx={{ color: 'text.secondary', fontSize: 20 }}
                      />
                      <Typography fontWeight={700} sx={{ lineHeight: 1.25 }}>
                        Dati dell&apos;ente
                      </Typography>
                    </Stack>

                    <AppTextField
                      required
                      label="Nome visibile su IO"
                      placeholder="Inserisci il nome visibile su IO"
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                      }}
                    />

                    <AppRadioGroup
                      value={sede}
                      onChange={(e) => setSede(e.target.value)}
                      options={SEDE_OPTIONS}
                      sx={{
                        py: 2,
                        gap: 1,
                        '& .MuiFormControlLabel-root': { m: 0 },
                      }}
                    />

                    <AppTextField
                      required
                      label="Indirizzo"
                      placeholder="Inserisci l'indirizzo"
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                      }}
                    />
                    <Stack spacing={2}>
                      <Stack spacing={0.5}>
                        <Typography sx={OVERLINE_LABEL_SX}>
                          Logo ente
                        </Typography>
                        <UploadDropzone
                          selectedFileName={logoFileName}
                          onFileSelect={(file) =>
                            setLogoFileName(file ? file.name : undefined)
                          }
                          title={'Trascina qui il logo del tuo ente'}
                          subtitle={
                            'Dimensione massima 300 x 300px - Formato .jpg o .png'
                          }
                        />
                        <Typography
                          variant="body2"
                          sx={{ mt: 3, fontWeight: 600, color: 'error.dark' }}
                        >
                          * Campo obbligatorio
                        </Typography>
                      </Stack>

                      <Stack spacing={0.5}>
                        <Typography sx={OVERLINE_LABEL_SX}>
                          Immagine di copertina
                        </Typography>
                        <UploadDropzone
                          selectedFileName={coverFileName}
                          onFileSelect={(file) =>
                            setCoverFileName(file ? file.name : undefined)
                          }
                          title={'Trascina qui un’immagine di copertina'}
                          subtitle={
                            'Dimensione massima 300 x 600 px - Formato .jpg o .png'
                          }
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Sub-card con bordo grigio */}
                <Paper
                  variant="outlined"
                  sx={{ borderRadius: 2, p: { xs: 1.5, md: 2 }, width: '100%' }}
                >
                  {/* Sezione: Contatti per l'assistenza */}
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ForumOutlinedIcon
                        sx={{ color: 'text.secondary', fontSize: 20 }}
                      />
                      <Typography fontWeight={700} sx={{ lineHeight: 1.25 }}>
                        Contatti per l’assistenza
                      </Typography>
                    </Stack>

                    {contacts.map((_, i) => (
                      <Stack key={i} spacing={2}>
                        <AppTextField
                          required
                          label={
                            i === 0
                              ? 'Inserisci contatto'
                              : `Inserisci contatto ${i + 1}`
                          }
                          placeholder="Inserisci contatto"
                          sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                          }}
                        />
                        <AppTextField
                          label={
                            i === 0
                              ? 'Inserisci sito web'
                              : `Inserisci sito web ${i + 1}`
                          }
                          placeholder="Sito web"
                          sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                          }}
                        />
                      </Stack>
                    ))}

                    <Box>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddContact}
                        sx={{ textTransform: 'none', fontWeight: 600, p: 0 }}
                      >
                        Aggiungi contatto
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Paper>

            {/* Footer con tasto Continua */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
              >
                Continua
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  useTheme,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { useToast } from '../../contexts';
import { useCreatePlaceMutation } from '../../features/places/api';
import { AppRadioList } from '../../components/RadioList';
import { FormField } from '../../components/FormField';
import { AppTextField } from '../../components/TextField';
import { AppSelect } from '../../components/Select';
import type { PlaceCreateRequest } from '../../generated/model';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';

type ContactState = {
  type: 'email' | 'phone' | 'website';
  value: string;
};

interface LocationState {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  websiteUrl: string;
  contacts: ContactState[];
}

const createDefaultLocation = (): LocationState => ({
  id: crypto.randomUUID(),
  name: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  websiteUrl: '',
  contacts: [{ type: 'phone', value: '' }],
});

const requiredTitle = (label: string) => (
  <>
    {label}{' '}
    <Box component="span" sx={{ color: 'common.requiredField' }}>
      *
    </Box>
  </>
);

export default function CreateLocationPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [createPlace] = useCreatePlaceMutation();

  const [type, setType] = useState<'offline' | 'online'>('offline');
  const [locations, setLocations] = useState<LocationState[]>([
    createDefaultLocation(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateLocation = (
    index: number,
    partial: Partial<LocationState>,
  ) => {
    setLocations((prev) =>
      prev.map((loc, i) => (i === index ? { ...loc, ...partial } : loc)),
    );
  };

  const handleRemoveLocation = (index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddLocation = () => {
    setLocations((prev) => [...prev, createDefaultLocation()]);
  };

  const handleAddContact = (locIndex: number) => {
    const loc = locations[locIndex];
    handleUpdateLocation(locIndex, {
      contacts: [...loc.contacts, { type: 'phone', value: '' }],
    });
  };

  const handleRemoveContact = (locIndex: number, contactIndex: number) => {
    const loc = locations[locIndex];
    handleUpdateLocation(locIndex, {
      contacts: loc.contacts.filter((_, i) => i !== contactIndex),
    });
  };

  const handleContactChange = (
    locIndex: number,
    contactIndex: number,
    field: keyof ContactState,
    value: string,
  ) => {
    const loc = locations[locIndex];
    const newContacts = [...loc.contacts];
    newContacts[contactIndex] = {
      ...newContacts[contactIndex],
      [field]: value,
    };
    handleUpdateLocation(locIndex, { contacts: newContacts });
  };

  const isLocValid = (loc: LocationState) => {
    if (!loc.name.trim()) return false;
    if (type === 'offline') {
      if (
        !loc.street.trim() ||
        !loc.city.trim() ||
        !loc.state.trim() ||
        !loc.postalCode.trim()
      ) {
        return false;
      }
    } else {
      if (!loc.websiteUrl.trim()) return false;
    }

    if (loc.contacts.some((c) => !c.value.trim())) return false;
    return true;
  };

  const isFormValid = () => {
    return locations.length > 0 && locations.every(isLocValid);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submittedLocations = locations;
      const results = await Promise.allSettled(
        submittedLocations.map((loc) => {
          let payload: PlaceCreateRequest;

          if (type === 'offline') {
            payload = {
              type: 'offline',
              name: loc.name,
              address: {
                street: loc.street,
                city: loc.city,
                state: loc.state,
                postalCode: loc.postalCode,
                country: 'IT',
              },
              supportContacts: loc.contacts,
            };
          } else {
            payload = {
              type: 'online',
              name: loc.name,
              website: {
                url: loc.websiteUrl,
              },
              supportContacts: loc.contacts,
            };
          }

          return createPlace(payload).unwrap();
        }),
      );

      const failedIds = new Set(
        results.flatMap((result, index) =>
          result.status === 'rejected' ? [submittedLocations[index].id] : [],
        ),
      );
      const createdCount = results.length - failedIds.size;

      if (failedIds.size > 0) {
        setLocations((current) =>
          current.filter((location) => failedIds.has(location.id)),
        );
        showToast(
          createdCount > 0
            ? `Creati ${createdCount} punti di accesso; ${failedIds.size} non creati. Puoi riprovare.`
            : 'Errore durante la creazione dei punti di accesso',
          'error',
        );
        return;
      }

      showToast('Punti di accesso creati con successo', 'success');
      navigate(APP_ROUTES.LOCATIONS);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        px: { xs: 2, md: 3.5 },
        py: { xs: 3, md: 4.5 },
        bgcolor: theme.palette.common.neutralGray,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(APP_ROUTES.LOCATIONS)}
          sx={{ mb: 3, color: 'text.primary', fontWeight: 700 }}
        >
          Indietro
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Crea nuovo punto di accesso
        </Typography>
        <Typography variant="body2" color="error" sx={{ mb: 4 }}>
          * Campo obbligatorio
        </Typography>

        <Stack spacing={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Dettagli
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Seleziona il tipo di punto di accesso che vuoi creare e inserisci
              le informazioni richieste.
            </Typography>

            <AppRadioList
              value={type}
              onChange={(val) => setType(val as 'offline' | 'online')}
              sx={{ gap: 4 }}
              options={[
                { value: 'offline', label: 'Sede fisica' },
                { value: 'online', label: 'Sito web' },
              ]}
            />
          </Paper>

          {locations.map((loc, locIndex) => (
            <Paper
              key={loc.id}
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 4 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  {type === 'offline' ? (
                    <RoomOutlinedIcon sx={{ color: 'text.secondary' }} />
                  ) : (
                    <LanguageOutlinedIcon sx={{ color: 'text.secondary' }} />
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {type === 'offline' ? 'Sede' : 'Sito web'}
                  </Typography>
                </Stack>
                {locIndex > 0 && (
                  <IconButton
                    onClick={() => handleRemoveLocation(locIndex)}
                    color="default"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>

              <Stack spacing={3}>
                <FormField
                  title={requiredTitle('Nome')}
                  required
                  value={loc.name}
                  onChange={(e) =>
                    handleUpdateLocation(locIndex, { name: e.target.value })
                  }
                  placeholder="Inserisci nome"
                >
                  <AppTextField />
                </FormField>

                {type === 'offline' ? (
                  <>
                    <FormField
                      title={requiredTitle('Indirizzo')}
                      required
                      value={loc.street}
                      onChange={(e) =>
                        handleUpdateLocation(locIndex, {
                          street: e.target.value,
                        })
                      }
                      placeholder="Es. Via Roma, 1"
                    >
                      <AppTextField />
                    </FormField>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <FormField
                          title={requiredTitle('Città')}
                          required
                          value={loc.city}
                          onChange={(e) =>
                            handleUpdateLocation(locIndex, {
                              city: e.target.value,
                            })
                          }
                          placeholder="Es. Roma"
                        >
                          <AppTextField />
                        </FormField>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FormField
                          title={requiredTitle('Provincia')}
                          required
                          value={loc.state}
                          onChange={(e) =>
                            handleUpdateLocation(locIndex, {
                              state: e.target.value,
                            })
                          }
                          placeholder="Es. RM"
                        >
                          <AppTextField />
                        </FormField>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FormField
                          title={requiredTitle('CAP')}
                          required
                          value={loc.postalCode}
                          onChange={(e) =>
                            handleUpdateLocation(locIndex, {
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="Es. 00100"
                        >
                          <AppTextField />
                        </FormField>
                      </Box>
                    </Stack>
                  </>
                ) : (
                  <FormField
                    title={requiredTitle('Sito web')}
                    required
                    value={loc.websiteUrl}
                    onChange={(e) =>
                      handleUpdateLocation(locIndex, {
                        websiteUrl: e.target.value,
                      })
                    }
                    placeholder="Es. https://www.example.com"
                  >
                    <AppTextField />
                  </FormField>
                )}
              </Stack>

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mt: 4, mb: 2 }}
              >
                Contatti di assistenza
              </Typography>

              <Stack spacing={2}>
                {loc.contacts.map((contact, contactIndex) => (
                  <Stack
                    key={contactIndex}
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                  >
                    <Box sx={{ width: { xs: '100%', md: 240 } }}>
                      <AppSelect
                        fullWidth
                        label="Tipo di contatto"
                        value={contact.type}
                        onChange={(e) =>
                          handleContactChange(
                            locIndex,
                            contactIndex,
                            'type',
                            e.target.value as string,
                          )
                        }
                        options={[
                          { value: 'email', label: 'Email' },
                          { value: 'phone', label: 'Telefono' },
                          { value: 'website', label: 'Sito web' },
                        ]}
                      />
                    </Box>
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <AppTextField
                        fullWidth
                        value={contact.value}
                        onChange={(e) =>
                          handleContactChange(
                            locIndex,
                            contactIndex,
                            'value',
                            e.target.value,
                          )
                        }
                        placeholder="Inserisci contatto"
                      />
                    </Box>
                    {contactIndex > 0 && (
                      <IconButton
                        onClick={() =>
                          handleRemoveContact(locIndex, contactIndex)
                        }
                        color="default"
                        sx={{ mt: { xs: 0, md: 0.5 } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                ))}
              </Stack>

              <Button
                startIcon={<AddIcon />}
                onClick={() => handleAddContact(locIndex)}
                sx={{
                  mt: 2,
                  fontWeight: 600,
                  display: 'flex',
                  width: 'fit-content',
                }}
              >
                Aggiungi contatto
              </Button>
            </Paper>
          ))}
        </Stack>

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddLocation}
          sx={{ mt: 3, fontWeight: 600, fontSize: 16 }}
        >
          Aggiungi nuovo
        </Button>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(APP_ROUTES.LOCATIONS)}
            sx={{ fontWeight: 600, px: 4 }}
          >
            Esci
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            sx={{ fontWeight: 600, px: 4 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Conferma'
            )}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

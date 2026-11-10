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
import { AppTextField } from '../../components/TextField';
import { AppSelect } from '../../components/Select';
import { getContactError } from '../../components/ContactRow/utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { getContactInputConfig } from '../Overview/CompleteData/components/constants/index.js';
import type { ContactState, LocationState } from './types';
import {
  getRequiredFieldError,
  getWebsiteUrlError,
  isLocValid,
} from './utils/validation';
import { submitLocations } from './utils/submitLocations';

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
  const [attempted, setAttempted] = useState(false);
  const [showUrlErrorIds, setShowUrlErrorIds] = useState<Set<string>>(
    new Set(),
  );

  const getRequiredError = (value: string) =>
    getRequiredFieldError(value, attempted);

  const getUrlError = (loc: LocationState) =>
    showUrlErrorIds.has(loc.id) ? getWebsiteUrlError(loc.websiteUrl) : null;

  const showUrlError = (id: string) =>
    setShowUrlErrorIds((prev) => new Set(prev).add(id));

  const getContactFieldError = (contact: ContactState) =>
    getContactError({
      contact,
      attempted,
      required: true,
    });

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

  const isFormValid = () => {
    return (
      locations.length > 0 && locations.every((loc) => isLocValid(loc, type))
    );
  };

  const handleSubmit = async () => {
    setAttempted(true);
    setShowUrlErrorIds(new Set(locations.map((loc) => loc.id)));
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await submitLocations({
        locations,
        type,
        createPlace: (payload) => createPlace(payload).unwrap(),
        keepFailedLocations: (failedIds) =>
          setLocations((current) =>
            current.filter((location) => failedIds.has(location.id)),
          ),
        navigate,
        showToast,
      });
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
              onChange={(val) => {
                setType(val as 'offline' | 'online');
                setAttempted(false);
                setShowUrlErrorIds(new Set());
              }}
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
                    <DeleteOutlineIcon />
                  </IconButton>
                )}
              </Stack>

              <Stack spacing={3}>
                <AppTextField
                  required
                  label="Nome"
                  placeholder="Inserisci nome"
                  value={loc.name}
                  error={!!getRequiredError(loc.name)}
                  helperText={getRequiredError(loc.name)}
                  onChange={(e) =>
                    handleUpdateLocation(locIndex, { name: e.target.value })
                  }
                />

                {type === 'offline' ? (
                  <>
                    <AppTextField
                      required
                      label="Indirizzo"
                      placeholder="Es. Via Roma, 1"
                      value={loc.street}
                      error={!!getRequiredError(loc.street)}
                      helperText={getRequiredError(loc.street)}
                      onChange={(e) =>
                        handleUpdateLocation(locIndex, {
                          street: e.target.value,
                        })
                      }
                    />
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <AppTextField
                          required
                          label="Città"
                          placeholder="Es. Roma"
                          value={loc.city}
                          error={!!getRequiredError(loc.city)}
                          helperText={getRequiredError(loc.city)}
                          onChange={(e) =>
                            handleUpdateLocation(locIndex, {
                              city: e.target.value,
                            })
                          }
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <AppTextField
                          required
                          label="Provincia"
                          placeholder="Es. RM"
                          value={loc.state}
                          error={!!getRequiredError(loc.state)}
                          helperText={getRequiredError(loc.state)}
                          onChange={(e) =>
                            handleUpdateLocation(locIndex, {
                              state: e.target.value,
                            })
                          }
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <AppTextField
                          required
                          label="CAP"
                          placeholder="Es. 00100"
                          value={loc.postalCode}
                          error={!!getRequiredError(loc.postalCode)}
                          helperText={getRequiredError(loc.postalCode)}
                          onChange={(e) =>
                            handleUpdateLocation(locIndex, {
                              postalCode: e.target.value,
                            })
                          }
                        />
                      </Box>
                    </Stack>
                  </>
                ) : (
                  <AppTextField
                    required
                    label="Sito web"
                    placeholder="Es. https://www.example.com"
                    value={loc.websiteUrl}
                    error={
                      !!getRequiredError(loc.websiteUrl) || !!getUrlError(loc)
                    }
                    helperText={
                      getRequiredError(loc.websiteUrl) ?? getUrlError(loc)
                    }
                    onChange={(e) =>
                      handleUpdateLocation(locIndex, {
                        websiteUrl: e.target.value,
                      })
                    }
                    onBlur={() => showUrlError(loc.id)}
                  />
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
                  <Box
                    key={contactIndex}
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, minmax(0, 1fr))',
                      },
                    }}
                  >
                    <AppSelect
                      fullWidth
                      sx={{ width: '100%' }}
                      label="Tipo di contatto"
                      required
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
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                      sx={{ gridColumn: { md: 'span 2' } }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <AppTextField
                          fullWidth
                          value={contact.value}
                          error={Boolean(getContactFieldError(contact))}
                          helperText={getContactFieldError(contact)}
                          onChange={(e) =>
                            handleContactChange(
                              locIndex,
                              contactIndex,
                              'value',
                              e.target.value,
                            )
                          }
                          label={
                            getContactInputConfig(contact.type).placeholder
                          }
                          type={getContactInputConfig(contact.type).type}
                          required
                        />
                      </Box>
                      {contactIndex > 0 && (
                        <IconButton
                          onClick={() =>
                            handleRemoveContact(locIndex, contactIndex)
                          }
                          sx={{
                            color: 'error.dark',
                            p: 2,
                            alignSelf: 'flex-start',
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
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
            disabled={isSubmitting}
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

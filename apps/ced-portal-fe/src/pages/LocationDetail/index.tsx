import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { useToast } from '../../contexts';
import {
  useDeletePlaceMutation,
  useGetPlaceByIdQuery,
} from '../../features/places/api';
import type { SupportContactResponseType } from '../../generated/model';
import { DeletePlaceModal } from '../Locations/components/DeletePlaceModal';

const getContactTypeLabel = (type: SupportContactResponseType) => {
  switch (type) {
    case 'email':
      return 'Email';
    case 'phone':
      return 'Telefono';
    case 'website':
      return 'Sito web';
    default:
      return type;
  }
};

interface DetailFieldProps {
  label: string;
  value: string;
}

const DetailField = ({ label, value }: Readonly<DetailFieldProps>) => (
  <Stack spacing={0.5} sx={{ py: 2 }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{value}</Typography>
  </Stack>
);

export default function LocationDetailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();

  const [deletePlace, { isLoading: isDeleting }] = useDeletePlaceMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const {
    data: place,
    isLoading,
    isError,
    refetch,
  } = useGetPlaceByIdQuery(id ?? '', { skip: !id || isDeleted });

  const handleDelete = useCallback(async () => {
    if (!id) return;
    try {
      setIsDeleted(true); // Skip immediately before mutation fires
      await deletePlace(id).unwrap();
      showToast('Punto di accesso eliminato con successo', 'success');
      navigate(APP_ROUTES.LOCATIONS);
    } catch {
      setIsDeleted(false); // Revert skip on failure
      showToast("Errore durante l'eliminazione", 'error');
    }
  }, [id, deletePlace, showToast, navigate]);

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: theme.palette.common.neutralGray,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !place) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: theme.palette.common.neutralGray,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <WarningAmberRoundedIcon
            sx={{ fontSize: 48, color: 'text.secondary' }}
          />
          <Typography variant="h6" color="text.secondary">
            Errore durante il caricamento
          </Typography>
          <Button variant="outlined" onClick={() => refetch()}>
            Riprova
          </Button>
        </Stack>
      </Box>
    );
  }

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
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(APP_ROUTES.LOCATIONS)}
          sx={{
            mb: 3,
            fontWeight: 600,
            px: 0,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
          color="primary"
        >
          Indietro
        </Button>

        <Typography
          variant="h2"
          sx={{ fontSize: { xs: 32, md: 40 }, fontWeight: 700, mb: 1 }}
        >
          Dettagli
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, fontSize: 18 }}>
          Ecco i dettagli della sede o del sito web che hai creato.
        </Typography>

        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, elevation: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 4 }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
              }}
            >
              {place.type === 'offline' ? (
                <RoomOutlinedIcon sx={{ color: 'text.secondary' }} />
              ) : (
                <LanguageOutlinedIcon sx={{ color: 'text.secondary' }} />
              )}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {place.name}
            </Typography>
          </Stack>

          <Typography
            variant="overline"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              display: 'block',
              mb: 1,
            }}
          >
            {place.type === 'offline' ? 'INDIRIZZO' : 'SITO WEB'}
          </Typography>

          {place.type === 'offline' ? (
            <Box sx={{ mb: 4 }}>
              <DetailField
                label="Indirizzo"
                value={place.address?.street ?? ''}
              />
              <Divider />
              <DetailField label="Città" value={place.address?.city ?? ''} />
              <Divider />
              <DetailField
                label="Provincia"
                value={place.address?.state ?? ''}
              />
              <Divider />
              <DetailField
                label="CAP"
                value={place.address?.postalCode ?? ''}
              />
            </Box>
          ) : (
            <Box sx={{ mb: 4 }}>
              <DetailField label="URL" value={place.website?.url ?? ''} />
            </Box>
          )}

          <Typography
            variant="overline"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              display: 'block',
              mb: 1,
            }}
          >
            CONTATTI DI ASSISTENZA
          </Typography>

          <Box>
            {place.supportContacts.map((contact, index) => (
              <Box key={contact.id}>
                <DetailField
                  label="Tipo di contatto"
                  value={getContactTypeLabel(contact.type)}
                />
                <Stack spacing={0.5} sx={{ pb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: 14 }}
                  >
                    Contatto
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                    {contact.value}
                  </Typography>
                </Stack>
                {index < place.supportContacts.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        </Paper>

        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={2}
          sx={{ mt: 3 }}
        >
          <Button
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setDeleteModalOpen(true)}
            sx={{ fontWeight: 600 }}
          >
            Elimina
          </Button>
          <Button variant="contained" color="primary" sx={{ fontWeight: 600 }}>
            Modifica
          </Button>
        </Stack>
      </Box>

      <DeletePlaceModal
        open={deleteModalOpen}
        isDeleting={isDeleting}
        locationName={place.name}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}

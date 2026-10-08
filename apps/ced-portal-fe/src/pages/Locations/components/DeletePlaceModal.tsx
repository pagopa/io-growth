import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

interface DeletePlaceModalProps {
  open: boolean;
  isDeleting: boolean;
  locationName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePlaceModal({
  open,
  isDeleting,
  locationName,
  onClose,
  onConfirm,
}: DeletePlaceModalProps) {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick' && !isDeleting) onClose();
      }}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 'min(560px, calc(100% - 32px))',
          m: 2,
          borderRadius: 2,
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <IconButton
          aria-label="Chiudi"
          onClick={onClose}
          disabled={isDeleting}
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 32 },
            right: { xs: 12, sm: 24 },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          component="h2"
          sx={{
            pr: { xs: 5, sm: 7 },
            fontSize: { xs: 22, sm: 28 },
            lineHeight: 1.2,
            fontWeight: 700,
          }}
        >
          Vuoi eliminare il punto di accesso?
        </Typography>

        <Typography
          sx={{
            mt: 2,
            color: 'text.secondary',
            fontSize: 16,
            lineHeight: 1.45,
          }}
        >
          Attenzione! Il punto di accesso <strong>{locationName}</strong> sarà
          eliminato dal sistema e non sarà più associato alle opportunità
          create.
        </Typography>

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
          justifyContent="flex-end"
          alignItems="center"
          sx={{ mt: 3 }}
        >
          <Button
            onClick={onClose}
            disabled={isDeleting}
            sx={{
              minWidth: { sm: 96 },
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Annulla
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={isDeleting}
            sx={{
              minWidth: { xs: '100%', sm: 112 },
              minHeight: 48,
              borderRadius: 2,
              fontSize: 16,
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            {isDeleting ? 'Eliminazione...' : 'Elimina'}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface RequestChangesModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
}

const MAX_LENGTH = 300;

export function RequestChangesModal({
  open,
  onClose,
  onConfirm,
}: Readonly<RequestChangesModalProps>) {
  const [message, setMessage] = useState('');

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(message);
    setMessage('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, p: 0 } }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative' }}>
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          <CloseIcon />
        </IconButton>

        <Stack spacing={2.5}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Richiedi modifiche
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 16 }}>
            La tua segnalazione sarà condivisa con l&apos;ente, che dovrà
            aggiornare l&apos;opportunità secondo le tue indicazioni e inviarla
            di nuovo in revisione.
          </Typography>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Descrivi la tua richiesta
            </Typography>
            <TextField
              fullWidth
              required
              label="Spiega in dettaglio cosa modificare"
              helperText={`Inserisci un testo di max ${MAX_LENGTH} caratteri`}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
              inputProps={{ maxLength: MAX_LENGTH }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={message.trim().length === 0}
              onClick={handleConfirm}
              sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
            >
              Conferma
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

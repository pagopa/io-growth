import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import type { OperatorDeleteOpportunityBody } from '../../../core/api/generated/model';
import { AppModal } from '../../../components/Modal';

interface DeleteOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: OperatorDeleteOpportunityBody) => void;
}

const MAX_REASON_LENGTH = 4096;

export function DeleteOpportunityModal({
  open,
  onClose,
  onConfirm,
}: DeleteOpportunityModalProps) {
  const [deletionMessage, setDeletionMessage] = useState('');
  const [messageError, setMessageError] = useState(false);

  const handleClose = () => {
    setDeletionMessage('');
    setMessageError(false);
    onClose();
  };

  const handleConfirm = () => {
    const validMessage = deletionMessage.trim().length > 0;

    setMessageError(!validMessage);

    if (!validMessage) {
      return;
    }

    onConfirm({ deletionMessage: deletionMessage.trim() });
    handleClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Elimina opportunità"
      description="L’opportunità sarà eliminata e invieremo comunicazione al Dipartimento."
    >
      <Stack spacing={3}>
        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Perché vuoi eliminare l’opportunità?
          </Typography>
          <TextField
            fullWidth
            required
            value={deletionMessage}
            error={messageError}
            helperText={
              messageError
                ? 'Inserisci un motivo'
                : `Inserisci un testo di max ${MAX_REASON_LENGTH} caratteri`
            }
            inputProps={{ maxLength: MAX_REASON_LENGTH }}
            placeholder="Spiega il motivo *"
            onChange={(event) => {
              setDeletionMessage(
                event.target.value.slice(0, MAX_REASON_LENGTH),
              );
              if (messageError) {
                setMessageError(false);
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="text" onClick={handleClose}>
            Annulla
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            sx={{ px: 4 }}
          >
            Conferma
          </Button>
        </Box>
      </Stack>
    </AppModal>
  );
}

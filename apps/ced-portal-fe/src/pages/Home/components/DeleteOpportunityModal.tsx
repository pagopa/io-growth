import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { AppDatePicker } from '../../../components/DatePicker';
import { AppModal } from '../../../components/Modal';

interface DeleteOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { reason: string; date: string }) => void;
}

const MAX_REASON_LENGTH = 200;

export function DeleteOpportunityModal({
  open,
  onClose,
  onConfirm,
}: DeleteOpportunityModalProps) {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const [dateError, setDateError] = useState(false);

  const handleClose = () => {
    setReason('');
    setDate('');
    setReasonError(false);
    setDateError(false);
    onClose();
  };

  const handleConfirm = () => {
    const validReason = reason.trim().length > 0;
    const validDate = date.trim().length > 0;

    setReasonError(!validReason);
    setDateError(!validDate);

    if (!validReason || !validDate) {
      return;
    }

    onConfirm({ reason: reason.trim(), date });
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
            value={reason}
            error={reasonError}
            helperText={
              reasonError
                ? 'Inserisci un motivo'
                : `Inserisci un testo di max ${MAX_REASON_LENGTH} caratteri`
            }
            inputProps={{ maxLength: MAX_REASON_LENGTH }}
            placeholder="Spiega il motivo *"
            onChange={(event) => {
              setReason(event.target.value.slice(0, MAX_REASON_LENGTH));
              if (reasonError) {
                setReasonError(false);
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

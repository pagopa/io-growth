import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { format, isValid, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { AppModal } from '../Modal';
import { AppDatePicker } from '../DatePicker';
import type { SuspendOpportunityPayload } from '../../features/opportunities/types';

interface SuspendOpportunityModalProps {
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (payload: SuspendOpportunityPayload) => void;
}

const UI_MAX_MESSAGE_LENGTH = 200;
const DATE_FORMAT = 'dd/MM/yyyy';
const REFERENCE_DATE = new Date();

export function SuspendOpportunityModal({
  open,
  isLoading = false,
  onClose,
  onConfirm,
}: Readonly<SuspendOpportunityModalProps>) {
  const [suspensionMessage, setSuspensionMessage] = useState('');
  const [suspendFrom, setSuspendFrom] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [dateError, setDateError] = useState(false);

  useEffect(() => {
    if (!open) {
      setSuspensionMessage('');
      setSuspendFrom('');
      setMessageError(false);
      setDateError(false);
    }
  }, [open]);

  const handleConfirm = () => {
    const trimmedMessage = suspensionMessage.trim();
    const isMessageValid = trimmedMessage.length > 0;
    const parsedDate = parse(suspendFrom, DATE_FORMAT, REFERENCE_DATE);
    const isDateValid = isValid(parsedDate);

    setMessageError(!isMessageValid);
    setDateError(!isDateValid);

    if (!isMessageValid || !isDateValid) {
      return;
    }

    onConfirm({
      suspensionMessage: trimmedMessage,
      suspendFrom: format(parsedDate, 'yyyy-MM-dd'),
    });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Sospendi opportunità"
      description="Invieremo un'email all'ente per informarlo."
    >
      <Stack spacing={3}>
        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Perché vuoi sospendere l’opportunità?
          </Typography>
          <TextField
            fullWidth
            required
            value={suspensionMessage}
            error={messageError}
            helperText={
              messageError
                ? 'Inserisci una motivazione'
                : `Inserisci un testo di max ${UI_MAX_MESSAGE_LENGTH} caratteri`
            }
            inputProps={{ maxLength: UI_MAX_MESSAGE_LENGTH }}
            placeholder="Spiega il motivo *"
            onChange={(event) => {
              setSuspensionMessage(
                event.target.value.slice(0, UI_MAX_MESSAGE_LENGTH),
              );
              if (messageError) {
                setMessageError(false);
              }
            }}
          />
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Data di sospensione
          </Typography>
          <AppDatePicker
            value={suspendFrom}
            error={dateError}
            helperText={
              dateError ? 'Seleziona una data valida' : 'Indica gg/mm/aaaa'
            }
            onChange={(value) => {
              setSuspendFrom(value);
              if (dateError) {
                setDateError(false);
              }
            }}
            label="Seleziona una data *"
            disablePast={false}
            sx={{ maxWidth: { xs: '100%', sm: 420 } }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="text" onClick={onClose} disabled={isLoading}>
            Annulla
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            sx={{ px: 4 }}
          >
            Conferma
          </Button>
        </Box>
      </Stack>
    </AppModal>
  );
}

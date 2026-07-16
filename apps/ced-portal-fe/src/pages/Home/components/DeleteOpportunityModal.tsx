import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import type { OperatorDeleteOpportunityBody } from '../../../core/api/generated/model';
import { AppDatePicker } from '../../../components';
import { AppModal } from '../../../components/Modal';

export type OpportunityActionModalPayload = {
  message: string;
  suspendDate?: string;
};

type OpportunityActionType = 'delete' | 'suspend';

interface OpportunityActionModalProps {
  actionType: OpportunityActionType;
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: OpportunityActionModalPayload) => void;
}

const MAX_REASON_LENGTH = 4096;

export function OpportunityActionModal({
  actionType,
  open,
  onClose,
  onConfirm,
}: OpportunityActionModalProps) {
  const [message, setMessage] = useState('');
  const [suspendDate, setSuspendDate] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [dateError, setDateError] = useState(false);

  const isSuspendAction = actionType === 'suspend';

  const handleClose = () => {
    setMessage('');
    setSuspendDate('');
    setMessageError(false);
    setDateError(false);
    onClose();
  };

  const handleConfirm = () => {
    const validMessage = message.trim().length > 0;
    const validDate = !isSuspendAction || suspendDate.trim().length > 0;

    setMessageError(!validMessage);
    setDateError(!validDate);

    if (!validMessage || !validDate) {
      return;
    }

    onConfirm({
      message: message.trim(),
      ...(isSuspendAction ? { suspendDate } : {}),
    });
    handleClose();
  };

  const title = isSuspendAction
    ? 'Sospendi opportunita'
    : 'Elimina opportunita';
  const description = isSuspendAction
    ? "L'opportunita verra sospesa a partire dalla data selezionata e invieremo comunicazione al Dipartimento."
    : "L'opportunita sara eliminata e invieremo comunicazione al Dipartimento.";
  const questionLabel = isSuspendAction
    ? "Perche vuoi sospendere l'opportunita?"
    : "Perche vuoi eliminare l'opportunita?";
  const placeholder = isSuspendAction
    ? 'Spiega il motivo'
    : 'Spiega il motivo *';

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
    >
      <Stack spacing={3}>
        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            {questionLabel}
          </Typography>
          <TextField
            fullWidth
            required
            value={message}
            error={messageError}
            helperText={
              messageError
                ? 'Inserisci un motivo'
                : `Inserisci un testo di max ${MAX_REASON_LENGTH} caratteri`
            }
            inputProps={{ maxLength: MAX_REASON_LENGTH }}
            placeholder={placeholder}
            onChange={(event) => {
              setMessage(event.target.value.slice(0, MAX_REASON_LENGTH));
              if (messageError) {
                setMessageError(false);
              }
            }}
          />
        </Box>

        {isSuspendAction ? (
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Data sospensione
            </Typography>
            <AppDatePicker
              value={suspendDate}
              onChange={(value) => {
                setSuspendDate(value);
                if (dateError) {
                  setDateError(false);
                }
              }}
              disablePast
              error={dateError}
              helperText={dateError ? 'Seleziona una data di sospensione' : ''}
            />
          </Box>
        ) : null}

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

interface DeleteOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: OperatorDeleteOpportunityBody) => void;
}

export function DeleteOpportunityModal({
  open,
  onClose,
  onConfirm,
}: DeleteOpportunityModalProps) {
  return (
    <OpportunityActionModal
      actionType="delete"
      open={open}
      onClose={onClose}
      onConfirm={(payload) => onConfirm({ deletionMessage: payload.message })}
    />
  );
}

import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { OperatorDeleteOpportunityBody } from '../../../generated/model';
import type {
  OperatorRepublishOpportunityPayload,
  RejectOpportunityRepublishPayload,
  SuspendOpportunityPayload,
} from '../../../features/opportunities/types';
import { AppDatePicker } from '../../../components';
import { AppModal } from '../../../components/Modal';

type OpportunityActionModalPayload = {
  message: string;
  suspendDate?: string;
};

type OpportunityActionType =
  | 'delete'
  | 'suspend'
  | 'republish'
  | 'rejectRepublish';

interface OpportunityActionModalProps {
  actionType: OpportunityActionType;
  open: boolean;
  onClose: () => void;
  onConfirm: (
    payload: OpportunityActionModalPayload,
  ) => void | boolean | Promise<void | boolean>;
  isLoading?: boolean;
}

const MAX_REASON_LENGTH = {
  delete: 4096,
  suspend: 4096,
  republish: 4096,
  rejectRepublish: 4096,
} satisfies Record<OpportunityActionType, number>;

function OpportunityActionModal({
  actionType,
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: OpportunityActionModalProps) {
  const [message, setMessage] = useState('');
  const [suspendDate, setSuspendDate] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [dateError, setDateError] = useState(false);

  const isSuspendAction = actionType === 'suspend';
  const maxReasonLength = MAX_REASON_LENGTH[actionType];

  const handleClose = () => {
    setMessage('');
    setSuspendDate('');
    setMessageError(false);
    setDateError(false);
    onClose();
  };

  const handleConfirm = async () => {
    const validMessage = message.trim().length > 0;
    const validDate = !isSuspendAction || suspendDate.trim().length > 0;

    setMessageError(!validMessage);
    setDateError(!validDate);

    if (!validMessage || !validDate) {
      return;
    }

    const shouldClose = await onConfirm({
      message: message.trim(),
      ...(isSuspendAction ? { suspendDate } : {}),
    });
    if (shouldClose !== false) {
      handleClose();
    }
  };

  const copy = {
    delete: {
      title: 'Elimina opportunita',
      description:
        "L'opportunità sarà eliminata e invieremo comunicazione al Dipartimento.",
      questionLabel: "Perché vuoi eliminare l'opportunita?",
    },
    suspend: {
      title: 'Sospendi opportunita',
      description:
        "L'opportunità verrà sospesa a partire dalla data selezionata e invieremo comunicazione al Dipartimento.",
      questionLabel: "Perché vuoi sospendere l'opportunita?",
    },
    republish: {
      title: 'Pubblica di nuovo l’opportunità',
      description:
        'L’opportunità sarà inviata al Dipartimento per l’approvazione prima di essere pubblicata di nuovo su IO.',
      questionLabel: 'Perché vuoi pubblicare di nuovo l’opportunità?',
    },
    rejectRepublish: {
      title: 'Rifiuta la richiesta di ripubblicazione',
      description:
        'La richiesta sarà rifiutata e il motivo sarà comunicato all’ente.',
      questionLabel: 'Perché vuoi rifiutare la richiesta di ripubblicazione?',
    },
  } satisfies Record<
    OpportunityActionType,
    { title: string; description: string; questionLabel: string }
  >;
  const { title, description, questionLabel } = copy[actionType];
  const placeholder = 'Spiega il motivo *';

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
                : `Inserisci un testo di max ${maxReasonLength} caratteri`
            }
            inputProps={{ maxLength: maxReasonLength }}
            placeholder={placeholder}
            onChange={(event) => {
              setMessage(event.target.value.slice(0, maxReasonLength));
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
              valueFormat="iso"
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
          <Button variant="text" onClick={handleClose} disabled={isLoading}>
            Annulla
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
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

interface SuspendOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: SuspendOpportunityPayload) => void;
}

interface RepublishOpportunityActionModalProps {
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (
    payload: OperatorRepublishOpportunityPayload,
  ) => boolean | Promise<boolean>;
}

export function RepublishOpportunityActionModal({
  open,
  isLoading = false,
  onClose,
  onConfirm,
}: RepublishOpportunityActionModalProps) {
  return (
    <OpportunityActionModal
      actionType="republish"
      open={open}
      onClose={onClose}
      onConfirm={(payload) => onConfirm({ republishMessage: payload.message })}
      isLoading={isLoading}
    />
  );
}

interface RejectOpportunityRepublishModalProps {
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (
    payload: RejectOpportunityRepublishPayload,
  ) => boolean | Promise<boolean>;
}

export function RejectOpportunityRepublishModal({
  open,
  isLoading = false,
  onClose,
  onConfirm,
}: RejectOpportunityRepublishModalProps) {
  return (
    <OpportunityActionModal
      actionType="rejectRepublish"
      open={open}
      onClose={onClose}
      onConfirm={(payload) =>
        onConfirm({ republishRejectionMessage: payload.message })
      }
      isLoading={isLoading}
    />
  );
}

export function SuspendOpportunityModal({
  open,
  onClose,
  onConfirm,
}: SuspendOpportunityModalProps) {
  return (
    <OpportunityActionModal
      actionType="suspend"
      open={open}
      onClose={onClose}
      onConfirm={(payload) =>
        onConfirm({
          suspendFrom: payload.suspendDate ?? '',
          suspensionMessage: payload.message,
        })
      }
    />
  );
}

import InfoIcon from '@mui/icons-material/InfoRounded';
import WarningIcon from '@mui/icons-material/WarningRounded';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useCancelScheduledSuspensionMutation } from '../../../../features/opportunities/api';
import { useToast } from '../../../../contexts';
import type { OpportunityStatus } from '../../../../features/opportunities/types';
import { opportunityAlertMap } from './constants';

type OpportunityAlertProps = {
  id: string;
  status: OpportunityStatus;
  suspendFrom?: string | null;
  suspensionMessage?: string | null;
  onCancelSuccess?: () => void;
};

export const OpportunityAlert = ({
  id,
  status,
  suspendFrom,
  suspensionMessage,
  onCancelSuccess,
}: OpportunityAlertProps) => {
  const { showToast } = useToast();
  const [cancelScheduledSuspension] = useCancelScheduledSuspensionMutation();

  const normalizedSuspendFrom = suspendFrom?.trim();
  const hasScheduledSuspension = Boolean(normalizedSuspendFrom);

  const formattedSuspendDate = normalizedSuspendFrom
    ? format(parseISO(normalizedSuspendFrom), 'dd/MM/yyyy')
    : null;

  const handleCancelScheduledSuspension = async () => {
    try {
      await cancelScheduledSuspension({ id }).unwrap();
      showToast('Sospensione pianificata annullata con successo', 'success');
      onCancelSuccess?.();
    } catch {
      showToast(
        "Errore durante l'annullamento della sospensione pianificata",
        'error',
      );
    }
  };

  if (hasScheduledSuspension && formattedSuspendDate) {
    return (
      <Alert
        severity="warning"
        icon={<WarningIcon sx={{ color: '#6A4F16', fontSize: 24 }} />}
        sx={{
          borderRadius: 2,
          py: 1,
          border: '1px solid #E7C267',
          backgroundColor: '#F5EED8',
          color: '#6A4F16',
          '& .MuiAlert-icon': {
            alignItems: 'flex-start',
            alignSelf: 'flex-start',
            mt: 0.5,
          },
          '& .MuiAlert-message': {
            p: 0,
            width: '100%',
          },
        }}
      >
        <Stack spacing={1.5}>
          <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
            {`L'opportunita sara sospesa dal ${formattedSuspendDate}`}
          </Typography>
          <Typography sx={{ fontSize: 18, color: '#6A4F16' }}>
            {suspensionMessage?.trim() || '-'}
          </Typography>
          <Button
            variant="text"
            onClick={handleCancelScheduledSuspension}
            sx={{
              alignSelf: 'flex-start',
              px: 0,
              minWidth: 0,
              fontSize: 18,
              fontWeight: 700,
              color: '#6A4F16',
              textTransform: 'none',
            }}
          >
            Annulla sospensione
          </Button>
        </Stack>
      </Alert>
    );
  }

  if (!opportunityAlertMap[status]) {
    return null;
  }
  const { title, description, severity, sx, icon, color } =
    opportunityAlertMap[status];

  const Icon = icon === 'info' ? InfoIcon : WarningIcon;

  return (
    <Alert
      severity={severity}
      icon={<Icon sx={{ color, fontSize: 24 }} />}
      sx={sx}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 20,
          color,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          mt: 1,
          fontSize: 18,
          lineHeight: 1.4,
          color,
        }}
      >
        {description}
      </Typography>
    </Alert>
  );
};

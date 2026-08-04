import InfoIcon from '@mui/icons-material/InfoRounded';
import WarningIcon from '@mui/icons-material/WarningRounded';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useOperatorCancelScheduledSuspensionMutation } from '../../../../features/opportunities/api';
import { useToast } from '../../../../contexts';
import type { OpportunityStatus } from '../../../../features/opportunities/types';
import { opportunityAlertMap } from './constants';
import { OpportunitySummaryItemSuspendedBy } from '../../../../core/api/generated/model';

type OpportunityAlertProps = {
  id: string;
  status: OpportunityStatus;
  suspendFrom?: string | null;
  suspensionMessage?: string | null;
  suspendedBy?: OpportunitySummaryItemSuspendedBy;
  onCancelSuccess?: () => void;
};

export const OpportunityAlert = ({
  id,
  status,
  suspendFrom,
  suspensionMessage,
  suspendedBy,
  onCancelSuccess,
}: OpportunityAlertProps) => {
  const { showToast } = useToast();
  const [cancelScheduledSuspension] =
    useOperatorCancelScheduledSuspensionMutation();

  const normalizedSuspendFrom = suspendFrom?.trim();
  const hasScheduledSuspension = Boolean(normalizedSuspendFrom);
  const isDepartmentScheduledSuspension = suspendedBy === 'department';

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
      <Box
        sx={{
          borderRadius: '8px',
          pt: 2.5,
          pb: 1,
          px: 2,
          border: (theme) =>
            `1px solid ${theme.palette.common.alertWarningBorder}`,
          backgroundColor: (theme) => theme.palette.common.alertWarningBg,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <WarningIcon
              sx={{
                color: (theme) => theme.palette.common.alertWarningText,
                fontSize: 24,
                mt: 0.25,
              }}
            />
            <Stack spacing={0.5} alignItems="flex-start">
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: (theme) => theme.palette.common.alertWarningText,
                }}
              >
                {isDepartmentScheduledSuspension
                  ? `L'opportunità sarà sospesa dal ${formattedSuspendDate}`
                  : `Hai richiesto la sospensione a partire dal ${formattedSuspendDate}`}
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  color: (theme) => theme.palette.common.alertWarningText,
                }}
              >
                {suspensionMessage?.trim() || '-'}
              </Typography>
              {!isDepartmentScheduledSuspension && (
                <Button
                  variant="text"
                  disableRipple
                  onClick={handleCancelScheduledSuspension}
                  sx={{
                    alignSelf: 'flex-start',
                    px: 0,
                    minWidth: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: (theme) => theme.palette.common.alertWarningText,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  Annulla sospensione programmata
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
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

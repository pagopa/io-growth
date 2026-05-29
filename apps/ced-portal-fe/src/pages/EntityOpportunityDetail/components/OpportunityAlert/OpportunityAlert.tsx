import InfoIcon from '@mui/icons-material/InfoRounded';
import WarningIcon from '@mui/icons-material/WarningRounded';
import { Alert, Typography } from '@mui/material';
import type { OpportunityStatus } from '../../../../features/opportunities/types';
import { opportunityAlertMap } from './constants';

type OpportunityAlertProps = {
  status: OpportunityStatus;
};

export const OpportunityAlert = ({ status }: OpportunityAlertProps) => {
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

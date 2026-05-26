import { AlertProps } from '@mui/material';
import { theme } from '../../../../core/theme';
import type { OpportunityStatus } from '../../../../features/opportunities/types';

const baseSx = {
  borderRadius: 2,
  py: 1,
  '& .MuiAlert-icon': {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    mt: 0.5,
  },
  '& .MuiAlert-message': {
    p: 0,
  },
};

export const opportunityAlertMap: Partial<
  Record<
    OpportunityStatus,
    {
      title: string;
      description: string;
      severity: AlertProps['severity'];
      color: string;
      icon: 'info' | 'warning';
      sx: any;
    }
  >
> = {
  approval_pending: {
    title: 'In revisione',
    description:
      "Il processo di revisione potrebbe richiedere un po' di tempo. Riceverai un'email con gli aggiornamenti.",
    severity: 'info',
    color: theme.palette.info[850],
    icon: 'info',
    sx: {
      color: theme.palette.info[850],
      border: '1px solid #89D9FC',
      ...baseSx,
    },
  },
  test_pending: {
    title: 'In fase di test',
    description: "L'opportunità è in fase di test.",
    severity: 'info',
    color: theme.palette.info[850],
    icon: 'info',
    sx: {
      color: theme.palette.info[850],
      border: '1px solid #89D9FC',
      ...baseSx,
    },
  },
};

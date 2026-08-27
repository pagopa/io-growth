import { MIAlertProps } from '@pagopa/mui-italia';
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
      severity: MIAlertProps['severity'];
      color: string;
      sx: any;
    }
  >
> = {
  test_pending: {
    title: 'In revisione',
    description:
      "Il processo di revisione potrebbe richiedere un po' di tempo. Riceverai un'email con gli aggiornamenti.",
    severity: 'info',
    color: theme.colors.info[850],
    sx: {
      color: theme.colors.info[850],
      border: '1px solid #89D9FC',
      ...baseSx,
    },
  },
  // TODO: confirm if we need to handle with this state
  test_rejected: {
    title: 'In fase di test',
    description: "L'opportunità è in fase di test.",
    color: theme.colors.info[850],
    severity: 'info',
    sx: {
      color: theme.colors.info[850],
      border: '1px solid #89D9FC',
      ...baseSx,
    },
  },
};

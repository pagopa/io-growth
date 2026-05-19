import { AlertProps } from '@mui/material';
import { theme } from '../../../../core/theme';
import { PublicationStatus } from '../../../../features/benefitsFilters/types';

export const opportunityAlertMap: Partial<
  Record<
    keyof typeof PublicationStatus,
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
  UNDER_REVIEW: {
    title: 'In revisione',
    description:
      "Il processo di revisione potrebbe richiedere un po' di tempo. Riceverai un'email con gli aggiornamenti.",
    severity: 'info',
    color: theme.palette.info[850],
    icon: 'info',
    sx: {
      color: theme.palette.info[850],
      border: '1px solid #89D9FC',
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
    },
  },
  CHANGES_REQUESTED: {
    title: 'É richiesta una modifica',
    description: '{value modifica da opportunity detail}',
    severity: 'warning',
    color: theme.palette.warning[850],
    icon: 'warning',
    sx: {
      color: theme.palette.warning[850],
      border: '1px solid #FFC107',
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
    },
  },
  SCHEDULED_PUBLICATION: {
    title: 'Pubblicazione programmata',
    description: 'L’opportunità sarà disponibile su IO dal {01/03/2026}.',
    severity: 'info',
    color: theme.palette.info[850],
    icon: 'info',
    sx: {
      color: theme.palette.info[850],
      border: '1px solid #89D9FC',
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
    },
  },
};

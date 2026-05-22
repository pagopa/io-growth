import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SendIcon from '@mui/icons-material/SendOutlined';

import { OpportunityDetail } from '../../../../features/opportunities/types';

import { OpportunitiesCtaItem, OpportunitiesCtasLayout } from './types';

const MODIFY_CTA: OpportunitiesCtaItem = {
  label: 'Modifica',
  variant: 'contained',
  actionId: 'MODIFY',
};

const DELETE_CTA: OpportunitiesCtaItem = {
  label: 'Elimina',
  color: 'error',
  variant: 'text',
  actionId: 'DELETE',
  startIcon: <DeleteIcon />,
};

const REQUEST_APPROVAL_CTA: OpportunitiesCtaItem = {
  label: 'Richiedi approvazione',
  variant: 'contained',
  actionId: 'REQUEST_APPROVAL',
  startIcon: <SendIcon />,
};

export const CTAS_BY_STATUS: Partial<
  Record<OpportunityDetail['publication_status'], OpportunitiesCtasLayout>
> = {
  DRAFT: {
    leftCtas: [DELETE_CTA],
    rightCtas: [MODIFY_CTA, REQUEST_APPROVAL_CTA],
  },
  CHANGES_REQUESTED: {
    rightCtas: [MODIFY_CTA, REQUEST_APPROVAL_CTA],
  },
  PUBLISHED: {
    leftCtas: [DELETE_CTA],
    rightCtas: [
      MODIFY_CTA,
      {
        label: 'Sospendi',
        variant: 'outlined',
        actionId: 'SUSPEND',
      },
    ],
  },
  SCHEDULED_PUBLICATION: {
    ctas: [MODIFY_CTA],
  },
  UNDER_REVIEW: {},
  DELETED: {},
  SUSPENDED: {
    leftCtas: [DELETE_CTA],
    rightCtas: [
      {
        label: 'Modifica',
        variant: 'outlined',
        actionId: 'MODIFY',
      },
      {
        label: 'Pubblica',
        variant: 'contained',
        actionId: 'PUBLISH',
      },
    ],
  },
};

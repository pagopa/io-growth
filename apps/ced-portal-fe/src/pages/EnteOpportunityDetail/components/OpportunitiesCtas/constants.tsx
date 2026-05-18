import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';

import { OpportunityDetail } from '../../../../features/opportunities/types';

import { OpportunitiesCtaItem, OpportunitiesCtasLayout } from './types';

const MODIFY_CTA: OpportunitiesCtaItem = {
  label: 'Modifica',
  variant: 'contained',
  actionId: 'MODIFY',
};

const DELETE_CTA: OpportunitiesCtaItem = {
  label: 'Elimina',
  variant: 'text',
  actionId: 'DELETE',
  startIcon: <DeleteIcon />,
};

export const CTAS_BY_STATUS: Partial<
  Record<OpportunityDetail['publication_status'], OpportunitiesCtasLayout>
> = {
  DRAFT: {
    leftCtas: [DELETE_CTA],
    rightCtas: [MODIFY_CTA],
  },
  CHANGES_REQUESTED: {
    ctas: [MODIFY_CTA],
  },
  PUBLISHED: {
    leftCtas: [DELETE_CTA],
    rightCtas: [
      MODIFY_CTA,
      {
        label: 'Sospendi',
        variant: 'outlined',
        actionId: 'SUSPENDE',
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

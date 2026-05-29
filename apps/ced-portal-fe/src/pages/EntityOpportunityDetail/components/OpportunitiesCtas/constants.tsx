import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { OpportunityStatus } from '../../../../features/opportunities/types';

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

export const CTAS_BY_STATUS: Partial<
  Record<OpportunityStatus, OpportunitiesCtasLayout>
> = {
  draft: {
    leftCtas: [DELETE_CTA],
    rightCtas: [MODIFY_CTA],
  },
  test_rejected: {},
  test_pending: {},
  test_passed: {},
  published: {
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
  deleted: {},
  suspended: {
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

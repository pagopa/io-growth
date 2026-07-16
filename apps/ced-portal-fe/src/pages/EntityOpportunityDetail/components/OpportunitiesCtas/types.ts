import { ButtonProps } from '@mui/material';
import type { OpportunityDetail } from '../../../../features/opportunities/types';

type ActionId = 'MODIFY' | 'DELETE' | 'SUSPEND' | 'PUBLISH';
type ExtendedActionId = ActionId | 'CANCEL_SUSPENSION';

export type OpportunitiesCtaItem = {
  label: string;
  variant: NonNullable<ButtonProps['variant']>;
  color?: ButtonProps['color'];
  startIcon?: React.ReactNode;
  actionId?: ExtendedActionId;
  action?: () => void;
};

export type OpportunitiesCtasProps = {
  status: OpportunityDetail['status'];
  id: OpportunityDetail['id'];
  suspendFrom?: OpportunityDetail['suspendFrom'];
};

export type OpportunitiesCtasLayout = {
  ctas?: OpportunitiesCtaItem[];
  leftCtas?: OpportunitiesCtaItem[];
  rightCtas?: OpportunitiesCtaItem[];
};

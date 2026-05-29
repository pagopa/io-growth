import { ButtonProps } from '@mui/material';
import type { OpportunityDetail } from '../../../../features/opportunities/types';

type ActionId = 'MODIFY' | 'DELETE' | 'SUSPEND' | 'PUBLISH';

export type OpportunitiesCtaItem = {
  label: string;
  variant: NonNullable<ButtonProps['variant']>;
  color?: ButtonProps['color'];
  startIcon?: React.ReactNode;
  actionId?: ActionId;
  action?: () => void;
};

export type OpportunitiesCtasProps = {
  status: OpportunityDetail['status'];
  id: OpportunityDetail['id'];
};

export type OpportunitiesCtasLayout = {
  ctas?: OpportunitiesCtaItem[];
  leftCtas?: OpportunitiesCtaItem[];
  rightCtas?: OpportunitiesCtaItem[];
};

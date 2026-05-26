import { ButtonProps } from '@mui/material';
import type { OpportunityStatus } from '../../../../features/opportunities/types';

type ActionId =
  | 'MODIFY'
  | 'DELETE'
  | 'SUSPEND'
  | 'PUBLISH'
  | 'REQUEST_APPROVAL';

export type OpportunitiesCtaItem = {
  label: string;
  variant: NonNullable<ButtonProps['variant']>;
  color?: ButtonProps['color'];
  startIcon?: React.ReactNode;
  actionId?: ActionId;
  action?: () => void;
};

export type OpportunitiesCtasProps = {
  status: OpportunityStatus;
  id: string;
};

export type OpportunitiesCtasLayout = {
  ctas?: OpportunitiesCtaItem[];
  leftCtas?: OpportunitiesCtaItem[];
  rightCtas?: OpportunitiesCtaItem[];
};

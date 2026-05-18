import { ButtonProps } from '@mui/material';
import { OpportunityDetail } from '../../../../features/opportunities/types';

type ActionId = 'MODIFY' | 'DELETE' | 'SUSPENDE' | 'PUBLISH';

export type OpportunitiesCtaItem = {
  label: string;
  variant: NonNullable<ButtonProps['variant']>;
  color?: ButtonProps['color'];
  startIcon?: React.ReactNode;
  actionId?: ActionId;
  action?: () => void;
};

export type OpportunitiesCtasProps = {
  status: OpportunityDetail['publication_status'];
  id: OpportunityDetail['id'];
};

export type OpportunitiesCtasLayout = {
  ctas?: OpportunitiesCtaItem[];
  leftCtas?: OpportunitiesCtaItem[];
  rightCtas?: OpportunitiesCtaItem[];
};

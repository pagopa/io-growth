import { ChipProps } from '@mui/material';
import type {
  OpportunityDetailResponse,
  OpportunitySummaryItem,
} from '../../../core/api/generated/model';
import { benefitStateLabelMap, opportunityStatusLabelMap } from './constants';

type ChipConfig = {
  item: OpportunitySummaryItem;
  role: 'admin' | 'operator';
};

export const getChipConfig = ({ item, role }: ChipConfig): ChipProps => {
  const config = (
    role === 'admin' ? opportunityStatusLabelMap : benefitStateLabelMap
  )[item.status];

  const color = config?.color ?? 'default';
  const label = config?.text ?? item.status;

  return {
    size: 'small',
    label,
    color,
    sx: {
      fontSize: 12,
      fontWeight: 700,
      height: 24,
      '& .MuiChip-label': {
        px: 1.2,
      },
    },
  };
};

export const getDetailChipConfig = (
  item: OpportunityDetailResponse,
): ChipProps => {
  const config = benefitStateLabelMap[item.status];

  const color = config?.color ?? 'default';
  const label = config?.text ?? item.status;

  return {
    size: 'small',
    label,
    color,
    sx: {
      fontSize: 12,
      fontWeight: 700,
      height: 24,
      '& .MuiChip-label': {
        px: 1.2,
      },
    },
  };
};

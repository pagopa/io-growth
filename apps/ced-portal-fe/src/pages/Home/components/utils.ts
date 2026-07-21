import { ChipProps } from '@mui/material';
import type { OpportunitySummaryItem } from '../../../core/api/generated/model';
import type { OpportunityDetail } from '../../../features/opportunities/types';
import { benefitStateLabelMap, opportunityStatusLabelMap } from './constants';

type ChipConfig = {
  item: OpportunitySummaryItem;
  role: 'admin' | 'operator';
};

export const getChipConfig = ({ item, role }: ChipConfig): ChipProps => {
  if (
    role === 'operator' &&
    (item as { suspendFrom?: string | null }).suspendFrom?.trim()
  ) {
    return {
      size: 'small',
      label: 'Sospensione programmata',
      color: 'info',
      sx: {
        fontSize: 12,
        fontWeight: 700,
        height: 24,
        '& .MuiChip-label': {
          px: 1.2,
        },
      },
    };
  }

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

export const getDetailChipConfig = (item: OpportunityDetail): ChipProps => {
  if (item.suspendFrom?.trim()) {
    return {
      size: 'small',
      label: 'Sospensione programmata',
      color: 'info',
      sx: {
        fontSize: 12,
        fontWeight: 700,
        height: 24,
        '& .MuiChip-label': {
          px: 1.2,
        },
      },
    };
  }

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

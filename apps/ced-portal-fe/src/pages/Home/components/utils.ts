import { ChipProps } from '@mui/material';
import type { Benefit } from '../../../features/benefits/types';
import { PublicationStatus } from '../../../features/benefitsFilters/types';
import { benefitStateLabelMap, opportunityStatusLabelMap } from './constants';

export const getChipConfig = (item: Benefit): ChipProps => {
  const config = opportunityStatusLabelMap[item.status];
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

export const getDetailChipConfig = (item: {
  publication_status: keyof typeof PublicationStatus;
}): ChipProps => {
  const config = benefitStateLabelMap[item.publication_status];
  const color = config?.color ?? 'default';
  const label = config?.text ?? item.publication_status;

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

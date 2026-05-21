import { ChipProps } from '@mui/material';
import type { Benefit } from '../../../features/benefits/types';
import { benefitStateLabelMap } from './constants';

export const getChipConfig = (item: Benefit): ChipProps => {
  const color =
    benefitStateLabelMap[item.publication_status]?.color ?? 'default';
  const label =
    benefitStateLabelMap[item.publication_status]?.text ??
    item.publication_status;

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

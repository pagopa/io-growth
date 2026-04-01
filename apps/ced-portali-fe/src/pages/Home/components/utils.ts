import { ChipProps } from '@mui/material';
import type { Benefit } from '../../../features/benefits/types';
import { benefitStateLabelMap } from './constants';

export const getChipConfig = (item: Benefit): ChipProps => {
  const chipColor = benefitStateLabelMap[item.state]?.color ?? 'default';
  return {
    size: 'small',
    label: benefitStateLabelMap[item.state]?.text ?? item.state,
    color: chipColor,
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

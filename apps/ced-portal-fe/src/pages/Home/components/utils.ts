import { ChipProps } from '@mui/material';
import type { Benefit } from '../../../features/benefits/types';
import { benefitStateLabelMap } from './constants';

export const getChipConfig = (item: Benefit): ChipProps => {
  console.log('🚀 ~ getChipConfig ~ item:', item);
  const chipColor =
    benefitStateLabelMap[item.publication_status]?.color ?? 'default';
  const a = {
    size: 'small' as any,
    label:
      benefitStateLabelMap[item.publication_status]?.text ??
      item.publication_status,
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
  console.log(a, 'getChipConfig ahisdhaishdiahi');
  return a;
};

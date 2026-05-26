import { ChipProps } from '@mui/material';
import { benefitStateLabelMap } from './constants';

export const getChipConfig = (item: { status: string }): ChipProps => {
  const key = item.status as keyof typeof benefitStateLabelMap;
  const color = benefitStateLabelMap[key]?.color ?? 'default';
  const label = benefitStateLabelMap[key]?.text ?? item.status;

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

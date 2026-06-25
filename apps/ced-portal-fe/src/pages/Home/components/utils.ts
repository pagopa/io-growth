import { ChipProps } from '@mui/material';
import type {
  OpportunityDetailResponse,
  OpportunitySummaryItem,
} from '../../../core/api/generated/model';
import { benefitStateLabelMap, opportunityStatusLabelMap } from './constants';
import { getDisplayStatus } from '../../../utils';

type ChipConfig = {
  item: OpportunitySummaryItem;
  role: 'admin' | 'operator';
};

export const getChipConfig = ({ item, role }: ChipConfig): ChipProps => {
  const displayStatus = getDisplayStatus(item.status, item.dateFrom);

  const config = (
    role === 'admin' ? opportunityStatusLabelMap : benefitStateLabelMap
  )[displayStatus];

  const color = config?.color ?? 'default';
  const label = config?.text ?? displayStatus;

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
  const displayStatus = getDisplayStatus(
    item.status,
    item.dateFrom, // oppure createdAt se manca
  );

  const config = benefitStateLabelMap[displayStatus];

  const color = config?.color ?? 'default';
  const label = config?.text ?? displayStatus;

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

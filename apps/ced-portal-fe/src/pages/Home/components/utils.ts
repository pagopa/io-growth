import { MIChipProps } from '@pagopa/mui-italia';
import type {
  OpportunitySummaryItem,
  OpportunitySummaryItemStatus,
} from '../../../core/api/generated/model';
import type { OpportunityDetail } from '../../../features/opportunities/types';
import { benefitStateLabelMap, opportunityStatusLabelMap } from './constants';

type ChipConfig = {
  item: OpportunitySummaryItem;
  role: 'admin' | 'operator';
};

type OpportunityWithSuspension = {
  status: OpportunitySummaryItemStatus;
  suspendFrom?: string | null;
};

const CHIP_SX: MIChipProps['sx'] = {
  fontSize: 12,
  fontWeight: 700,
  height: 24,
  '& .MuiChip-label': {
    px: 1.2,
  },
};

const isScheduledSuspension = ({
  status,
  suspendFrom,
}: OpportunityWithSuspension): boolean =>
  status === 'scheduled_suspension' ||
  (status === 'published' && Boolean(suspendFrom?.trim()));

const buildChipConfig = (
  label: string,
  color: MIChipProps['color'],
): MIChipProps => ({
  label,
  color,
  sx: CHIP_SX,
});

export const getChipConfig = ({ item, role }: ChipConfig): MIChipProps => {
  if (role === 'operator' && isScheduledSuspension(item)) {
    return buildChipConfig('Sospensione programmata', 'info');
  }

  const config = (
    role === 'admin' ? opportunityStatusLabelMap : benefitStateLabelMap
  )[item.status];

  const color = config?.color ?? 'default';
  const label = config?.text ?? item.status;

  return buildChipConfig(label, color);
};

export const getDetailChipConfig = (item: OpportunityDetail): MIChipProps => {
  if (isScheduledSuspension(item)) {
    return buildChipConfig('Sospensione programmata', 'info');
  }

  const config = benefitStateLabelMap[item.status];

  const color = config?.color ?? 'default';
  const label = config?.text ?? item.status;

  return buildChipConfig(label, color);
};

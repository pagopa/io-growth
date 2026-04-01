import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { Chip } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { Benefit } from '../../../features/benefits/types';
import { benefitStateLabelMap } from './constants';
import { getChipConfig } from './utils';

export interface BenefitsTableColumn {
  id: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortAccessor?: (item: Benefit) => string | number;
  renderCell: (item: Benefit, theme: Theme) => ReactNode;
}

export const benefitsTableColumns: BenefitsTableColumn[] = [
  {
    id: 'name',
    label: 'Nome',
    sortable: true,
    sortAccessor: (item) => item.name,
    renderCell: (item) => item.name,
  },
  {
    id: 'category',
    label: 'Categoria',
    sortable: true,
    sortAccessor: (item) => item.category,
    renderCell: (item) => item.category,
  },
  {
    id: 'createdAt',
    label: 'Creata il',
    sortable: true,
    sortAccessor: (item) => item.created_by,
    renderCell: (item) => item.created_by,
  },
  {
    id: 'state',
    label: 'Stato',
    sortable: true,
    sortAccessor: (item) =>
      benefitStateLabelMap[item.state]?.text ?? item.state,
    renderCell: (item) => <Chip {...getChipConfig(item)} />,
  },
  {
    id: 'actions',
    label: '',
    width: 48,
    align: 'right',
    renderCell: (_item, theme) => (
      <MoreVertRoundedIcon
        sx={{
          color: theme.palette.common.primaryButton,
          fontSize: 24,
        }}
      />
    ),
  },
];

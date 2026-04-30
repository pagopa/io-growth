import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { format, parseISO } from 'date-fns';
import { Chip } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { Benefit } from '../../../features/benefits/types';
import { getChipConfig } from './utils';
import {
  BenefitCategory,
  BenefitStatus,
} from '../../../features/benefitsFilters/types';

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
    sortAccessor: (item) =>
      BenefitCategory[item.category as keyof typeof BenefitCategory],
    renderCell: (item) =>
      BenefitCategory[item.category as keyof typeof BenefitCategory],
  },
  {
    id: 'createdAt',
    label: 'Creata il',
    sortable: true,
    sortAccessor: (item) => parseISO(item.createdAt).getTime(),
    renderCell: (item) =>
      format(parseISO(item.createdAt), 'dd/MM/yyyy - HH:mm'),
  },
  {
    id: 'state',
    label: 'Stato',
    sortable: true,
    sortAccessor: (item) =>
      BenefitStatus[item.state as keyof typeof BenefitStatus],
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

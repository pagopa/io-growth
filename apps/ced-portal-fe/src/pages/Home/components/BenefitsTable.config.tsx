import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { format, parseISO } from 'date-fns';
import { Chip, IconButton } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { MouseEvent, ReactNode } from 'react';
import type { Benefit } from '../../../features/benefits/types';
import { getChipConfig } from './utils';
import {
  BenefitCategory,
  PublicationStatus,
} from '../../../features/benefitsFilters/types';

export interface BenefitsTableColumn {
  id: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortAccessor?: (item: Benefit) => string | number;
  renderCell: (
    item: Benefit,
    theme: Theme,
    action: (event: MouseEvent<HTMLElement>, itemId: string) => void,
  ) => ReactNode;
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
    id: 'publication_status',
    label: 'Stato',
    sortable: true,
    sortAccessor: (item) => PublicationStatus[item.publication_status],
    renderCell: (item) => <Chip {...getChipConfig(item)} />,
  },
  {
    id: 'actions',
    label: '',
    width: 48,
    align: 'right',
    renderCell: (item, theme, action) => (
      <IconButton
        size="small"
        onClick={(event) => action(event, item.id)}
        sx={{ color: theme.palette.common.primaryButton, p: 0.4 }}
      >
        <MoreVertRoundedIcon sx={{ fontSize: 22 }} />
      </IconButton>
    ),
  },
];

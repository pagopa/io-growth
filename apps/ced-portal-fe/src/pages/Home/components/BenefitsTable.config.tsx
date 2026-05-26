import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format, parseISO } from 'date-fns';
import { Chip, IconButton } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { MouseEvent, ReactNode } from 'react';
import type { Benefit } from '../../../features/benefits/types';
import { getChipConfig } from './utils';
import { publicationStatusLabels } from '../../../features/benefitsFilters/types';

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
    sortAccessor: (item) => item.categoryTitle,
    renderCell: (item) => item.categoryTitle,
  },
  {
    id: 'dateFrom',
    label: 'Data inizio',
    sortable: true,
    sortAccessor: (item) => parseISO(item.dateFrom).getTime(),
    renderCell: (item) => format(parseISO(item.dateFrom), 'dd/MM/yyyy'),
  },
  {
    id: 'status',
    label: 'Stato',
    sortable: true,
    sortAccessor: (item) => publicationStatusLabels[item.status],
    renderCell: (item) => <Chip {...getChipConfig(item)} />,
  },
  {
    id: 'actions',
    label: '',
    width: 48,
    align: 'right',
    renderCell: (item, _theme, action) => (
      <IconButton size="small" onClick={(event) => action(event, item.id)}>
        <MoreVertIcon sx={{ fontSize: 22 }} />
      </IconButton>
    ),
  },
];

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Chip, IconButton } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import type { MouseEvent, ReactNode } from 'react';
import type {
  OpportunitySummaryItem,
  OpportunitySummaryItemStatus,
} from '../../../core/api/generated/model';
import { publicationStatusLabels } from '../../../features/benefitsFilters/types';
import { getChipConfig } from './utils';
import { generatePath, Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';

export interface BenefitsTableColumn {
  id: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortAccessor?: (item: OpportunitySummaryItem) => string | number;
  renderCell: (
    item: OpportunitySummaryItem,
    theme: Theme,
    action: (
      event: MouseEvent<HTMLElement>,
      itemId: string,
      itemStatus: OpportunitySummaryItemStatus,
    ) => void,
  ) => ReactNode;
}

export const benefitsTableColumns: BenefitsTableColumn[] = [
  {
    id: 'name',
    label: 'Nome',
    sortable: true,
    sortAccessor: (item) => item.name,
    renderCell: (item, theme) => (
      <Link
        to={generatePath(APP_ROUTES.ENTITY_OPPORTUNITY_DETAIL, { id: item.id })}
        state={{ id: item.id }}
        style={{
          color: theme.palette.common.primaryButton,
          textDecoration: 'none',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {item.name}
      </Link>
    ),
  },
  {
    id: 'categoryTitle',
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
    renderCell: (item) => (
      <Chip {...getChipConfig({ item, role: 'operator' })} />
    ),
  },
  {
    id: 'actions',
    label: '',
    width: 48,
    align: 'right',
    renderCell: (item, _theme, action) => (
      <IconButton
        size="small"
        onClick={(event) => action(event, item.id, item.status)}
      >
        <MoreVertIcon sx={{ fontSize: 22 }} />
      </IconButton>
    ),
  },
];

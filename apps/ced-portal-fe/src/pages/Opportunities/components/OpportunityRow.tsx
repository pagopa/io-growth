import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Checkbox, IconButton, TableCell, TableRow } from '@mui/material';
import { MIChip, theme } from '@pagopa/mui-italia';
import { generatePath, Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import {
  STATE_COLORS,
  STATE_OPTIONS,
} from '../../../constants/opportunityState';
import type { Opportunity } from '../../../features/opportunities/types';

interface OpportunityRowProps {
  item: Opportunity;
  selected: boolean;
  onSelect: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
}

export const OpportunityRow = ({
  item,
  selected,
  onSelect,
  onMenuOpen,
}: OpportunityRowProps) => {
  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={() => onSelect(item.id)} />
      </TableCell>

      <TableCell>
        <Link
          to={generatePath(APP_ROUTES.OPPORTUNITY_DETAIL, {
            id: item.id,
          })}
          style={{
            color: theme.palette.common.primaryButton,
            textDecoration: 'none',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {item.name}
        </Link>
      </TableCell>

      <TableCell>{item.operatorName}</TableCell>

      <TableCell>
        {new Date(item.dateFrom).toLocaleDateString('it-IT')}
      </TableCell>

      <TableCell>
        <MIChip
          label={
            STATE_OPTIONS.find((o) => o.value === item.status)?.label ??
            item.status
          }
          color={STATE_COLORS[item.status] ?? 'default'}
        />
      </TableCell>

      <TableCell>
        <IconButton size="small" onClick={(e) => onMenuOpen(e, item.id)}>
          <MoreVertIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

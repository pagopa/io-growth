import { TableRow, TableCell, Checkbox, IconButton, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Opportunity } from '../../../features/opportunities/types';
import {
  STATE_OPTIONS,
  STATE_COLORS,
} from '../../../constants/opportunityState';
import { getDisplayStatus } from '../../../utils';
import { generatePath, Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import { theme } from '@pagopa/mui-italia';

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
  const displayStatus = getDisplayStatus(item.status, item.dateFrom);

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
        <Chip
          label={
            STATE_OPTIONS.find((o) => o.value === displayStatus)?.label ??
            displayStatus
          }
          color={STATE_COLORS[displayStatus] ?? 'default'}
          size="small"
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

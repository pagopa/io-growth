import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, TableCell, TableRow } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { generatePath, Link } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import type {
  OfflinePlaceResponse,
  PlaceListItem,
} from '../../../generated/model';

interface PlaceRowProps {
  item: PlaceListItem;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
}

const formatAddress = (address: OfflinePlaceResponse['address']) => {
  const { city, street } = address;
  return `${street}, ${city}`;
};

export const PlaceRow = ({ item, onMenuOpen }: PlaceRowProps) => {
  return (
    <TableRow hover>
      <TableCell>
        <Link
          to={generatePath(APP_ROUTES.LOCATION_DETAIL, {
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

      <TableCell>
        {item.type === 'offline'
          ? formatAddress(item.address)
          : item.website.url}
      </TableCell>

      <TableCell>{item.associatedOpportunities}</TableCell>

      <TableCell>
        <IconButton size="small" onClick={(e) => onMenuOpen(e, item.id)}>
          <MoreVertIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

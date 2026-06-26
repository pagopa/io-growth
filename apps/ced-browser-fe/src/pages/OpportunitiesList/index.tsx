import { Box, Typography } from '@mui/material';
import { DiscoveryListItem } from '../../components';
import { theme } from '../../core/theme';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toOpportunityDetailRoute } from '../../app/routeConfig';
import { useGetOpportunitiesSearchQuery } from '../../features/opportunities/api';
import { generateDiscoveryItemsConfig } from '../Home/constants';

export default function OpportunitiesList() {
  const navigate = useNavigate();

  const { data } = useGetOpportunitiesSearchQuery({
    limit: 30,
  });

  const items = generateDiscoveryItemsConfig(data?.items);

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <Box
        sx={{
          display: 'flex',
          p: 3,
          cursor: 'pointer',
        }}
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon sx={{ mr: 1 }} />
        <Typography variant="body1">Indietro</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          gap: 2,
        }}
      >
        <Typography variant="h2">Nuove opportunità</Typography>
        <Typography variant="body1">
          Ecco le ultime opportunità pubblicate dai partner.
        </Typography>
      </Box>
      {items.map((item, index, list) => (
        <DiscoveryListItem
          key={`${item.id}-${index}`}
          sx={{ backgroundColor: theme.palette.background.paper }}
          divider={index < list.length - 1}
          onClick={() => navigate(toOpportunityDetailRoute(item.id))}
          {...item}
        />
      ))}
    </Box>
  );
}

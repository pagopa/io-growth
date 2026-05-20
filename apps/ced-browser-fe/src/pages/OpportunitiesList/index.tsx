import { Box, Typography } from '@mui/material';
import { DiscoveryListItem } from '../../components';
import { theme } from '../../core/theme';
import { DISCOVERY_ITEMS_CONFIG } from '../Home/constants';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toOpportunityDetailRoute } from '../../app/routeConfig';
export default function OpportunitiesList() {
  const navigate = useNavigate();

  // mock to reach max length of opportunities list (30)
  const mockOpportunities = [
    ...DISCOVERY_ITEMS_CONFIG,
    ...(Array(30 - DISCOVERY_ITEMS_CONFIG.length).fill(
      DISCOVERY_ITEMS_CONFIG[DISCOVERY_ITEMS_CONFIG.length - 1],
    ) as typeof DISCOVERY_ITEMS_CONFIG),
  ];

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
      {mockOpportunities.map((item, index, list) => (
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

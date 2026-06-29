import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toOpportunityDetailRoute } from '../../app/routeConfig';
import { DiscoveryListItem, PageHeader } from '../../components';
import { theme } from '../../core/theme';
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
      <PageHeader
        title="Nuove opportunità"
        subtitle="Ecco le ultime opportunità pubblicate dai partner."
      />
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

import { Box } from '@mui/material';
import { ListSkeleton, WarningBanner } from '@pagopa/io-core-ui';
import { useNavigate } from 'react-router-dom';
import { toOpportunityDetailRoute } from '../../app/routeConfig';
import { DiscoveryListItem, PageHeader } from '../../components';
import { theme } from '../../core/theme';
import { useGetOpportunitiesSearchQuery } from '../../features/opportunities/api';
import { generateDiscoveryItemsConfig } from '../Home/constants';
export default function OpportunitiesList() {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetOpportunitiesSearchQuery({
    limit: 30,
  });

  const items = generateDiscoveryItemsConfig(data?.items);

  const renderContent = () => {
    if (isError) {
      return (
        <WarningBanner
          title="C’è stato un problema nel caricamento delle opportunità."
          action={{
            label: 'Ricarica',
            onClick: () => void refetch(),
          }}
        />
      );
    }

    if (isLoading) {
      return <ListSkeleton length={10} includeMargin />;
    }

    if (!items || items.length === 0) {
      return <WarningBanner title="Non ci sono opportunità da mostrare." />;
    }

    return items.map((item, index, list) => (
      <DiscoveryListItem
        key={`${item.id}-${index}`}
        sx={{ backgroundColor: theme.palette.background.paper }}
        divider={index < list.length - 1}
        onClick={() => navigate(toOpportunityDetailRoute(item.id))}
        {...item}
      />
    ));
  };

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <PageHeader
        title="Nuove opportunità"
        subtitle="Ecco le ultime opportunità pubblicate dai partner."
      />
      {renderContent()}
    </Box>
  );
}

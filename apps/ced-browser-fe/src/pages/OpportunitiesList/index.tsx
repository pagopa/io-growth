import { Box } from '@mui/material';
import { ListSkeleton, WarningBanner } from '@pagopa/io-core-ui';
import { useNavigate } from 'react-router-dom';
import { toOpportunityDetailRoute } from '../../app/routeConfig';
import { DiscoveryListItem, PageHeader } from '../../components';
import { theme } from '../../core/theme';
import { useGetOpportunitiesSearchQuery } from '../../features/opportunities/api';
import { generateDiscoveryItemsConfig } from '../Home/constants';
import { useTrackLandedInPage } from '../../mixpanel/useTrackLandedInPage';
import { trackBrowserEvent } from '../../mixpanel/trackEvent';
export default function OpportunitiesList() {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetOpportunitiesSearchQuery({
    limit: 30,
  });

  const items = generateDiscoveryItemsConfig(data?.items);

  useTrackLandedInPage('CED_OPPORTUNITY_LIST');

  const handleItemClick = (
    item: ReturnType<typeof generateDiscoveryItemsConfig>[number],
  ) => {
    // Tracking values are kept in the event payload for now; they may move into the item config in a future refactor.
    const findInfo = data?.items.find(({ id }) => id === item.id);
    navigate(toOpportunityDetailRoute(item.id));

    // Some values from the search API are not yet available in the current response model.
    trackBrowserEvent('CED_OPPORTUNITY_SELECTED', {
      event_type: 'tap',
      opportunity_name: item.title,
      organization_name: findInfo?.profileDisplayName,
      organization_fiscal_code: '',
      location_name: '',
    });
  };

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
        onClick={() => handleItemClick(item)}
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

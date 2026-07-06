import { Box, Button, Stack, useTheme } from '@mui/material';
import { LabelCaption, ListSkeleton, WarningBanner } from '@pagopa/io-core-ui';
import {
  APP_ROUTES,
  toOpportunityDetailRoute,
} from '../../../../app/routeConfig';
import { DiscoveryListItem } from '../../../../components';

import { useNavigate } from 'react-router-dom';
import { useGetOpportunitiesSearchQuery } from '../../../../features/opportunities/api';
import { generateDiscoveryItemsConfig } from '../../constants';

const DiscoverySection = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data, isLoading, isError, refetch } = useGetOpportunitiesSearchQuery({
    limit: 10,
  });

  const discoveryItems = generateDiscoveryItemsConfig(data?.items);

  const renderList = () => {
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
      return <ListSkeleton length={3} includeMargin={true} />;
    }

    return discoveryItems?.map((item, index, list) => (
      <DiscoveryListItem
        {...item}
        key={item.id}
        sx={{ backgroundColor: theme.palette.background.paper }}
        divider={index < list.length - 1}
        onClick={() => navigate(toOpportunityDetailRoute(item.id))}
      />
    ));
  };

  return (
    <Stack direction="column">
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box px={3} sx={{ flexShrink: 0 }}>
          <LabelCaption>NUOVE OPPORTUNITÀ</LabelCaption>
        </Box>
        <Button
          variant="text"
          sx={{ color: theme.palette.common.primaryButton }}
          onClick={() => navigate(APP_ROUTES.OPPORTUNITIES_LIST)}
        >
          Mostra tutti
        </Button>
      </Stack>
      {renderList()}
    </Stack>
  );
};

export default DiscoverySection;

import { Box, Button, Collapse, Stack } from '@mui/material';
import { LabelCaption, Title, VSpacer } from '@pagopa/io-core-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES, toOpportunityDetailRoute } from '../../app/routeConfig';
import { DiscoveryListItem } from '../../components';
import { InfoBox } from '../../components/Infobox';
import { theme } from '../../core/theme';
import { useGetOpportunitiesSearchQuery } from '../../features/opportunities/api';
import { Carousel } from './components/Carousel';
import { EntitiesSearch } from './components/EntitiesSearch';
import {
  PARTNERS_CARDS_CONFIG,
  generateDiscoveryItemsConfig,
} from './constants';

export default function HomePage() {
  const navigate = useNavigate();
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { data } = useGetOpportunitiesSearchQuery({
    limit: 10,
  });
  const discoveryItems = generateDiscoveryItemsConfig(data?.items);

  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        height: '100dvh',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehaviorY: 'contain',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Stack direction="column" px={3} pt={3}>
        <Collapse in={!isSearchActive}>
          <Title text="Scopri le opportunità" variant="LG" />
          <VSpacer size={16} />
        </Collapse>
        <EntitiesSearch
          isSearchActive={isSearchActive}
          setIsSearchActive={setIsSearchActive}
        />
      </Stack>

      {!isSearchActive && (
        <>
          <Stack direction="column" gap={2}>
            <Box px={3} sx={{ flexShrink: 0 }}>
              <LabelCaption>IN PRIMO PIANO</LabelCaption>
            </Box>
            <Carousel list={PARTNERS_CARDS_CONFIG} />
          </Stack>

          <Stack direction="column">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
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
            {discoveryItems?.map((item, index, list) => (
              <DiscoveryListItem
                {...item}
                key={item.id}
                sx={{ backgroundColor: theme.palette.background.paper }}
                divider={index < list.length - 1}
                onClick={() => navigate(toOpportunityDetailRoute(item.id))}
              />
            ))}
          </Stack>

          <Box px={3} sx={{ flexShrink: 0 }}>
            <InfoBox
              title="Sai che la Carta vale anche in Europa?"
              description="Diversi Paesi dell'Unione Europea offrono opportunità a chi ha la Carta Europea della Disabilità"
              linkText="Scopri dove usarla"
              onLinkClick={() => navigate(APP_ROUTES.EUROPEAN_OPPORTUNITIES)}
            />
          </Box>

          <Box sx={{ height: '40px', flexShrink: 0 }} />
        </>
      )}
    </Stack>
  );
}

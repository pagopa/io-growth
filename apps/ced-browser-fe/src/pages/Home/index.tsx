import { Box, Collapse, Stack } from '@mui/material';
import { LabelCaption, Title, VSpacer } from '@pagopa/io-core-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { InfoBox } from '../../components/Infobox';
import { theme } from '../../core/theme';
import { Carousel } from './components/Carousel';
import DiscoverySection from './components/DiscoverySection';
import { EntitiesSearch } from './components/EntitiesSearch';
import { PARTNERS_CARDS_CONFIG } from './constants';

export default function HomePage() {
  const navigate = useNavigate();
  const [isSearchActive, setIsSearchActive] = useState(false);

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
            {/* TODO: after API implementation, attach banner and loading skeleton */}
            <Carousel list={PARTNERS_CARDS_CONFIG} />
          </Stack>
          <DiscoverySection />
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

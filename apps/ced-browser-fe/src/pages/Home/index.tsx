import { Stack, Typography, Box, Button, Collapse } from '@mui/material';
import { Carousel } from './components/Carousel';
import { PARTNERS_CARDS_CONFIG, DISCOVERY_ITEMS_CONFIG } from './constants';
import { DiscoveryListItem } from '../../components';
import { InfoBox } from '../../components/Infobox';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { theme } from '../../core/theme';
import { useState } from 'react';
import { OpportunitySearch } from './components/OpportunitySearch';

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
          <Typography variant="h4" sx={{ fontWeight: 700, pb: 2 }}>
            Scopri le opportunità
          </Typography>
        </Collapse>
        <OpportunitySearch
          isSearchActive={isSearchActive}
          setIsSearchActive={setIsSearchActive}
        />
      </Stack>

      {!isSearchActive && (
        <>
          <Stack direction="column" gap={2}>
            <Typography
              variant="caption"
              sx={{
                px: 3,
                fontWeight: 700,
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              IN PRIMO PIANO
            </Typography>
            <Carousel list={PARTNERS_CARDS_CONFIG} />
          </Stack>

          <Stack direction="column">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant="caption"
                sx={{
                  px: 3,
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                }}
              >
                NUOVE OPPORTUNITÀ
              </Typography>
              <Button
                variant="text"
                sx={{ color: theme.palette.common.primaryButton }}
              >
                Mostra tutti
              </Button>
            </Stack>
            {DISCOVERY_ITEMS_CONFIG.map((item, index, list) => (
              <DiscoveryListItem
                key={item.id}
                sx={{ backgroundColor: theme.palette.background.paper }}
                divider={index < list.length - 1}
                {...item}
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

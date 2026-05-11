import { Stack, Typography, Box } from '@mui/material';
import { Carousel } from './components/Carousel';
import { PARTNERS_CARDS_CONFIG, DISCOVERY_ITEMS_CONFIG } from './constants';
import { AppTextField, DiscoveryListItem } from '../../components';
import { InfoBox } from '../../components/Infobox';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        height: '100dvh',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehaviorY: 'contain',
      }}
    >
      <Stack direction="column" gap={2} px={3} pt={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Scopri le opportunità
        </Typography>
        <AppTextField placeholder="Cerca per città, struttura o ente" />
      </Stack>

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
          In primo piano
        </Typography>
        <Carousel list={PARTNERS_CARDS_CONFIG} />
      </Stack>

      <Stack direction="column" gap={1} px={3}>
        {DISCOVERY_ITEMS_CONFIG.map((item) => (
          <DiscoveryListItem key={item.id} {...item} />
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
    </Box>
  );
}

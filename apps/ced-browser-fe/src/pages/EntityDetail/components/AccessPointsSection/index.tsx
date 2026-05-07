import { Box, ButtonBase, Divider, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DiscoveryListItem } from '../../../../components/index.js';
import type { EntityAccessPoint } from '../../../../features/entities/types.js';
import { APP_ROUTES } from '../../../../app/routeConfig.js';
import { SectionTitle } from '../SectionTitle/index.js';

const ITEMS_LIMIT = 10;

export function AccessPointsSection({
  entityId,
  items,
}: {
  entityId: string;
  items: EntityAccessPoint[];
}) {
  const navigate = useNavigate();
  if (items.length === 0) return null;

  const visibleItems = items.slice(0, ITEMS_LIMIT);
  const hasMore = items.length > ITEMS_LIMIT;

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <SectionTitle
        label="Punti di accesso"
        action={
          hasMore ? (
            <ButtonBase
              onClick={() =>
                navigate(
                  APP_ROUTES.ENTITY_ACCESS_POINTS.replace(':id', entityId),
                )
              }
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'primary.main',
                  mr: 1,
                  textTransform: 'uppercase',
                }}
              >
                Mostra tutte
              </Typography>
            </ButtonBase>
          ) : undefined
        }
      />
      <Stack divider={<Divider sx={{ mx: 4 }} />}>
        {visibleItems.map((item) => (
          <DiscoveryListItem
            key={item.id}
            variant="simple"
            title={item.title}
            subtitle={item.subtitle}
            sx={{ px: 0, bgcolor: 'background.paper' }}
          />
        ))}
      </Stack>
    </Box>
  );
}

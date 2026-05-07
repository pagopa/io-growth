import { Box, ButtonBase, Divider, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DiscoveryListItem } from '../../../../components/index.js';
import type { EntityOpportunity } from '../../../../features/entities/types.js';
import { APP_ROUTES } from '../../../../app/routeConfig.js';
import { SectionTitle } from '../SectionTitle/index.js';

const ITEMS_LIMIT = 10;

export function OpportunitiesSection({
  entityId,
  items,
}: {
  entityId: string;
  items: EntityOpportunity[];
}) {
  const navigate = useNavigate();
  if (items.length === 0) return null;

  const visibleItems = items.slice(0, ITEMS_LIMIT);
  const hasMore = items.length > ITEMS_LIMIT;

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <SectionTitle
        label="Opportunità"
        action={
          hasMore ? (
            <ButtonBase
              onClick={() =>
                navigate(
                  APP_ROUTES.ENTITY_OPPORTUNITIES.replace(':id', entityId),
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
            variant="opportunity"
            eyebrow={item.eyebrow}
            title={item.title}
            badgeLabel={item.badgeLabel}
            sx={{ px: 0, bgcolor: 'background.paper' }}
          />
        ))}
      </Stack>
    </Box>
  );
}

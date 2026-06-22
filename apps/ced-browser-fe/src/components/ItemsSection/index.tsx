import {
  Box,
  ButtonBase,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  APP_ROUTES,
  toEntityAccessPointDetailRoute,
  toOpportunityDetailRoute,
} from '../../app/routeConfig';
import { DiscoveryListItem } from '../';
import { SectionTitle } from '../SectionTitle';
import type { ItemsSectionProps } from './types';

const ITEMS_LIMIT = 10;

export function ItemsSection(props: ItemsSectionProps) {
  const { variant, entityId, items, sectionLabel } = props;
  const hideEyebrow =
    props.variant === 'opportunity' && (props.hideEyebrow ?? false);
  const navigate = useNavigate();
  const theme = useTheme();

  const hasMore = items.length > ITEMS_LIMIT;
  const defaultLabel =
    variant === 'opportunity' ? 'Opportunità' : 'Punti di accesso';
  const label = sectionLabel ?? defaultLabel;
  const route =
    variant === 'opportunity'
      ? APP_ROUTES.ENTITY_OPPORTUNITIES
      : APP_ROUTES.ENTITY_ACCESS_POINTS;

  const renderedItems = useMemo(() => {
    if (variant === 'opportunity') {
      return items.slice(0, ITEMS_LIMIT).map(({ id, ...item }) => (
        <DiscoveryListItem
          key={id}
          variant="opportunity"
          {...item}
          sx={{ px: 0, bgcolor: 'background.paper' }}
          onClick={() => navigate(toOpportunityDetailRoute(id))}
          // TODO api does not return eyebrow text or badgeLabel - for test api i'll use those properties for now
          badgeLabel={'badgeLabel'}
          eyebrow={hideEyebrow ? undefined : item.title}
        />
      ));
    }

    return items
      .slice(0, ITEMS_LIMIT)
      .map(({ id, ...item }) => (
        <DiscoveryListItem
          key={id}
          variant="simple"
          {...item}
          sx={{ px: 0, bgcolor: 'background.paper' }}
          onClick={() => navigate(toEntityAccessPointDetailRoute(entityId, id))}
        />
      ));
  }, [variant, items, hideEyebrow, navigate, entityId]);

  if (items.length === 0) return null;

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <SectionTitle
        label={label}
        action={
          hasMore ? (
            <ButtonBase
              onClick={() => navigate(route.replace(':id', entityId))}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.palette.common.primaryButton,
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
      <Stack divider={<Divider sx={{ mx: 4 }} />}>{renderedItems}</Stack>
    </Box>
  );
}

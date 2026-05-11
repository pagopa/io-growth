import { Box, ButtonBase, Divider, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig.js';
import { DiscoveryListItem } from '../index.js';
import { SectionTitle } from '../SectionTitle/index.js';
import type { ItemsSectionProps } from './types.js';

const ITEMS_LIMIT = 10;

export function ItemsSection(props: ItemsSectionProps) {
  const { variant, entityId, items, sectionLabel } = props;
  const hideEyebrow =
    props.variant === 'opportunity' && (props.hideEyebrow ?? false);
  const navigate = useNavigate();

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
      return items
        .slice(0, ITEMS_LIMIT)
        .map(({ id, ...item }) => (
          <DiscoveryListItem
            key={id}
            variant="opportunity"
            {...item}
            eyebrow={hideEyebrow ? undefined : item.eyebrow}
            sx={{ px: 0, bgcolor: 'background.paper' }}
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
        />
      ));
  }, [variant, items, hideEyebrow]);

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
                  color: '#0B3EE3',
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

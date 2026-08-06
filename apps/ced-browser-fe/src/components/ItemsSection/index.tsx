import { Box, Divider, Stack } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiscoveryListItem } from '../';
import {
  APP_ROUTES,
  toEntityAccessPointDetailRoute,
  toOpportunityDetailRoute,
} from '../../app/routeConfig';
import { SectionTitle } from '../SectionTitle';
import type { ItemsSectionProps } from './types';

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
            sx={{ px: 0, bgcolor: 'background.paper' }}
            onClick={() => navigate(toOpportunityDetailRoute(id))}
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
          onClick={() => navigate(toEntityAccessPointDetailRoute(id))}
        />
      ));
  }, [variant, items, hideEyebrow, navigate]);

  if (items.length === 0) return null;

  const handleOnClick = () => navigate(route.replace(':id', entityId));

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <SectionTitle
        label={label}
        action={
          hasMore ? (
            <Body
              asLink
              onClick={handleOnClick}
              fontSize="14px"
              fontWeight="Semibold"
              avoidTextDecoration
            >
              MOSTRA TUTTE
            </Body>
          ) : undefined
        }
      />
      <Stack divider={<Divider sx={{ mx: 4 }} />}>{renderedItems}</Stack>
    </Box>
  );
}

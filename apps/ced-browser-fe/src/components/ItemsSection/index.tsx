import { Box, ButtonBase, Divider, Stack } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiscoveryListItem } from '../';
import {
  APP_ROUTES,
  toEntityAccessPointDetailRoute,
  toOpportunityDetailRoute,
} from '../../app/routeConfig';
import { SectionTitle } from '../SectionTitle';
import type { ItemsSectionProps } from './types';
import { trackBrowserEvent } from '../../mixpanel/trackEvent';

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

  const handleLocationItemClicked = useCallback(
    (item: (typeof items)[number]) => {
      trackBrowserEvent('CED_LOCATION_SELECTED', {
        event_type: 'tap',
        organization_name: item.organization_name,
        organization_fiscal_code: item.organization_fiscal_code,
        location_name: item.title,
      });
      navigate(toEntityAccessPointDetailRoute(item.id));
    },
    [navigate],
  );

  const handleOpportunityItemClicked = useCallback(
    ({
      title,
      id,
      organization_fiscal_code,
      organization_name,
      location_name,
    }: (typeof items)[number]) => {
      trackBrowserEvent('CED_OPPORTUNITY_SELECTED', {
        event_type: 'tap',
        opportunity_name: title,
        organization_name,
        organization_fiscal_code,
        location_name,
      });
      navigate(toOpportunityDetailRoute(id));
    },
    [navigate],
  );

  const renderedItems = useMemo(() => {
    if (variant === 'opportunity') {
      return items
        .slice(0, ITEMS_LIMIT)
        .map((item) => (
          <DiscoveryListItem
            key={item.id}
            variant="opportunity"
            {...item}
            sx={{ px: 0, bgcolor: 'background.paper' }}
            onClick={() => handleOpportunityItemClicked(item)}
            eyebrow={hideEyebrow ? undefined : item.title}
          />
        ));
    }

    return items
      .slice(0, ITEMS_LIMIT)
      .map((item) => (
        <DiscoveryListItem
          key={item.id}
          variant="simple"
          {...item}
          sx={{ px: 0, bgcolor: 'background.paper' }}
          onClick={() => handleLocationItemClicked(item)}
        />
      ));
  }, [
    variant,
    items,
    hideEyebrow,
    handleOpportunityItemClicked,
    handleLocationItemClicked,
  ]);

  if (items.length === 0) return null;

  const handleOnClick = () => navigate(route.replace(':id', entityId));

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <SectionTitle
        label={label}
        action={
          hasMore ? (
            <ButtonBase onClick={handleOnClick}>
              <Body
                onClick={handleOnClick}
                asLink
                fontSize="14px"
                fontWeight="Semibold"
                avoidTextDecoration
              >
                MOSTRA TUTTE
              </Body>
            </ButtonBase>
          ) : undefined
        }
      />
      <Stack divider={<Divider sx={{ mx: 4 }} />}>{renderedItems}</Stack>
    </Box>
  );
}

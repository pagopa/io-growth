import { Box, ButtonBase, Stack, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContactsSection } from '../../components/ContactsSection/index.js';
import { ItemsSection } from '../../components/ItemsSection/index.js';
import { PageHeader, QueryGuard } from '../../components/index.js';
import { APP_ROUTES } from '../../app/routeConfig.js';
import { useGetAccessPointDetailQuery } from '../../features/places/api.js';
import { formatBadgeLabel } from '../../utils';
import { PageErrorType } from '../../components/QueryGuard/ErrorScreen/types.js';
import { useTrackLandedInPage } from '../../mixpanel/useTrackLandedInPage.js';
import {
  EntityOpportunityItems,
  PlaceDetailItems,
} from '../../components/ItemsSection/types.js';

export default function AccessPointDetailPage() {
  const location = useLocation();

  const state = location.state as { source: string };

  const { accessPointId } = useParams<{
    accessPointId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError, error, refetch } =
    useGetAccessPointDetailQuery(
      { accessPointId: accessPointId ?? '' },
      { skip: !accessPointId },
    );

  const opportunities: EntityOpportunityItems[] = useMemo(
    () =>
      data?.opportunities.map(({ id, title, benefit }) => ({
        id,
        title,
        badgeLabel: formatBadgeLabel(benefit),
        organization_name: data?.entityName,
        // The organization fiscal code is not exposed by the current API response.
        organization_fiscal_code: '',
      })) ?? [],
    [data],
  );

  const relatedAccessPoints: PlaceDetailItems[] = useMemo(
    () =>
      data?.relatedPlaces.map(({ id, title, address }) => ({
        id,
        title,
        subtitle: address ? `${address.street}, ${address.city}` : '',
        organization_name: data?.entityName,
        organization_fiscal_code: '',
        location_name: data?.title,
      })) ?? [],
    [data],
  );

  const trackExtraProperties = useMemo(
    () => ({
      location_name: data?.title ?? '',
      organization_name: data?.entityName ?? '',
      // The organization fiscal code is not exposed by the current API response.
      organization_fiscal_code: '',
    }),
    [data],
  );

  useTrackLandedInPage(
    'CED_LOCATION_DETAIL',
    {
      ...trackExtraProperties,
      source: state?.source,
    },
    !!data,
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      errorType={PageErrorType.ACCESS_POINT_NOT_FOUND}
      firstAction={{
        label: 'Riprova',
        onClick: () => refetch(),
      }}
    >
      {(resolvedData) => (
        <Box
          sx={{
            pb: 'calc(48px + env(safe-area-inset-bottom, 0px))',
            bgcolor: 'background.paper',
          }}
        >
          <PageHeader
            title={resolvedData.title}
            subtitle={
              <ButtonBase
                onClick={() =>
                  navigate(
                    APP_ROUTES.ENTITY_DETAIL.replace(
                      ':id',
                      resolvedData.entityId,
                    ),
                  )
                }
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.palette.common.primaryButton,
                  textDecoration: 'underline',
                }}
              >
                {resolvedData.entityName}
              </ButtonBase>
            }
          />

          <Stack spacing={2} sx={{ mt: 2, mb: 4 }}>
            <ItemsSection
              variant="opportunity"
              entityId={data?.entityId ?? ''}
              items={opportunities}
              hideEyebrow
            />
            <ContactsSection
              contacts={resolvedData.contacts}
              trackExtraProperties={trackExtraProperties}
            />
            <ItemsSection
              variant="access-point"
              entityId={data?.entityId ?? ''}
              items={relatedAccessPoints}
              sectionLabel="Potrebbero interessarti"
            />
          </Stack>
        </Box>
      )}
    </QueryGuard>
  );
}

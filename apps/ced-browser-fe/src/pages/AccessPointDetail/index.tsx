import { Box, ButtonBase, Stack, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContactsSection } from '../../components/ContactsSection/index.js';
import { ItemsSection } from '../../components/ItemsSection/index.js';
import { PageHeader, QueryGuard } from '../../components/index.js';
import { APP_ROUTES } from '../../app/routeConfig.js';
import type { PlaceBenefit } from '../../core/api/generated/model/index.js';
import { useGetAccessPointDetailQuery } from '../../features/places/api.js';

function formatBadgeLabel(benefit: PlaceBenefit): string {
  if (benefit.type === 'free') return 'GRATIS';
  if (benefit.type === 'discount' && benefit.value != null) {
    return benefit.discountType === 'fixed_amount'
      ? `-${benefit.value}€`
      : `-${benefit.value}%`;
  }
  if (benefit.type === 'reduced_fixed_price' && benefit.value != null) {
    return `${benefit.value}€`;
  }
  return benefit.type;
}

export default function AccessPointDetailPage() {
  const { id, accessPointId } = useParams<{
    id: string;
    accessPointId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError } = useGetAccessPointDetailQuery(
    { entityId: id ?? '', accessPointId: accessPointId ?? '' },
    { skip: !accessPointId || !id },
  );

  const opportunities = useMemo(
    () =>
      data?.opportunities.map(({ id, title, benefit }) => ({
        id,
        title,
        badgeLabel: formatBadgeLabel(benefit),
      })) ?? [],
    [data],
  );

  const relatedAccessPoints = useMemo(
    () =>
      data?.relatedPlaces.map(({ id, title, address }) => ({
        id,
        title,
        subtitle: address ? `${address.street}, ${address.city}` : '',
      })) ?? [],
    [data],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      isError={isError}
      data={data}
      errorMessage="Impossibile caricare i dati del punto di accesso."
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
              entityId={id ?? ''}
              items={opportunities}
              hideEyebrow
            />
            <ContactsSection contacts={resolvedData.contacts} />
            <ItemsSection
              variant="access-point"
              entityId={id ?? ''}
              items={relatedAccessPoints}
              sectionLabel="Potrebbero interessarti"
            />
          </Stack>
        </Box>
      )}
    </QueryGuard>
  );
}

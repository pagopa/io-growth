import { Box, Divider, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DiscoveryListItem, PageHeader, QueryGuard } from '../../components';
import { useGetEntityDetailQuery } from '../../features/entities/api';
import { toEntityAccessPointDetailRoute } from '../../app/routeConfig';
import { PageErrorType } from '../../components/QueryGuard/ErrorScreen/types';

export default function EntityAccessPointsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useGetEntityDetailQuery(
    id ?? '',
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      errorType={PageErrorType.ENTITY_NOT_FOUND}
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
            title="Tutti i punti di accesso"
            subtitle={
              <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
                di{' '}
                <Box
                  component="span"
                  sx={{ fontWeight: 700, color: 'text.primary' }}
                >
                  {resolvedData.displayName}
                </Box>
              </Typography>
            }
          />

          <Stack divider={<Divider aria-hidden sx={{ mx: 2 }} />} sx={{ px: 2 }}>
            {resolvedData.recentPlaces.map((item) => (
              <DiscoveryListItem
                key={item.id}
                variant="simple"
                title={item.name}
                subtitle={
                  item.street && item.city
                    ? `${item.street}, ${item.city}`
                    : undefined
                }
                onClick={() =>
                  navigate(toEntityAccessPointDetailRoute(item.id))
                }
                sx={{ px: 0, bgcolor: 'background.paper' }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </QueryGuard>
  );
}

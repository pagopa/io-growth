import { Box, Divider, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DiscoveryListItem, PageHeader, QueryGuard } from '../../components';
import { toOpportunityDetailRoute } from '../../app/routeConfig';
import { useGetEntityDetailQuery } from '../../features/entities/api';
import { formatBadgeLabel } from '../../utils';
import { PageErrorType } from '../../components/QueryGuard/ErrorScreen/types';

export default function EntityOpportunitiesPage() {
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
            title="Tutte le opportunità"
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

          <Stack divider={<Divider sx={{ mx: 2 }} />}>
            {resolvedData.recentOpportunities.map((item) => (
              <DiscoveryListItem
                key={item.id}
                variant="opportunity"
                title={item.name}
                badgeLabel={formatBadgeLabel(item.beneficiaryBenefit)}
                sx={{ px: 0, bgcolor: 'background.paper' }}
                onClick={() =>
                  navigate(toOpportunityDetailRoute(item.id), {
                    state: { source: 'organization_detail' },
                  })
                }
              />
            ))}
          </Stack>
        </Box>
      )}
    </QueryGuard>
  );
}

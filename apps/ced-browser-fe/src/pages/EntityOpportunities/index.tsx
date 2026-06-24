import { Box, Divider, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DiscoveryListItem, PageHeader, QueryGuard } from '../../components';
import { toOpportunityDetailRoute } from '../../app/routeConfig';
import { useGetEntityDetailQuery } from '../../features/entities/api';
import { formatBadgeLabel } from '../../utils';

export default function EntityOpportunitiesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetEntityDetailQuery(id ?? '');

  return (
    <QueryGuard
      isLoading={isLoading}
      isError={isError}
      data={data}
      errorMessage="Impossibile caricare i dati dell'ente."
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
                onClick={() => navigate(toOpportunityDetailRoute(item.id))}
              />
            ))}
          </Stack>
        </Box>
      )}
    </QueryGuard>
  );
}

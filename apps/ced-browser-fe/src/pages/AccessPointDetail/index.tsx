import { Box, ButtonBase, Stack, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ContactsSection } from '../../components/ContactsSection/index.js';
import { ItemsSection } from '../../components/ItemsSection/index.js';
import { PageHeader, QueryGuard } from '../../components/index.js';
import { useGetAccessPointDetailQuery } from '../../features/entities/api.js';
import { APP_ROUTES } from '../../app/routeConfig.js';

export default function AccessPointDetailPage() {
  const { id, accessPointId } = useParams<{
    id: string;
    accessPointId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError } = useGetAccessPointDetailQuery(
    { entityId: id ?? '', accessPointId: accessPointId ?? '' },
    { skip: !id || !accessPointId },
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

          <Stack spacing={2} sx={{ mt: 2, mb: 4, px: 2 }}>
            <ItemsSection
              variant="opportunity"
              entityId={id ?? ''}
              items={resolvedData.opportunities}
              hideEyebrow
            />
            <ContactsSection contacts={resolvedData.contacts} />
            <ItemsSection
              variant="access-point"
              entityId={id ?? ''}
              items={resolvedData.relatedAccessPoints}
              sectionLabel="Potrebbero interessarti"
            />
          </Stack>
        </Box>
      )}
    </QueryGuard>
  );
}

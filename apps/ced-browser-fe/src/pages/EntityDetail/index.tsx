import { Box, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetEntityDetailQuery } from '../../features/entities/api.js';
import { ItemsSection } from '../../components/ItemsSection/index.js';
import { ContactsSection } from '../../components/ContactsSection/index.js';
import { PageHeader, QueryGuard } from '../../components/index.js';

export default function EntityDetailPage() {
  const { id } = useParams<{ id: string }>();
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
          <PageHeader title={resolvedData.name} />

          <Stack spacing={2} sx={{ mt: 2, mb: 4 }}>
            <ItemsSection
              variant="opportunity"
              entityId={id ?? ''}
              items={resolvedData.opportunities}
            />
            <ItemsSection
              variant="access-point"
              entityId={id ?? ''}
              items={resolvedData.accessPoints}
            />
            <ContactsSection contacts={resolvedData.contacts} />
          </Stack>
        </Box>
      )}
    </QueryGuard>
  );
}

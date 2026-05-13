import { AccountBalanceOutlined } from '@mui/icons-material';
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
          <PageHeader
            title={resolvedData.name}
            leadingContent={
              resolvedData.accessPoints.length === 0 ? (
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'common.neutralGray',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccountBalanceOutlined
                    sx={{ fontSize: 42, color: '#BBC2D6' }}
                  />
                </Box>
              ) : undefined
            }
          />

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

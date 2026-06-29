import { Box, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { PageHeader, QueryGuard } from '../../components';
import { ContactsSection } from '../../components/ContactsSection';
import { ItemsSection } from '../../components/ItemsSection/index';
import type { PlaceDetailRelatedItem } from '../../core/api/generated/model/index.js';
import { useGetEntityDetailQuery } from '../../features/entities/api';
import type {
  EntityContacts,
  EntityOpportunity,
} from '../../features/entities/types.js';
import { formatBadgeLabel } from '../../utils/formatBadgeLabel.js';
import { EntityPlaceholderIcon } from './components/EntityPlaceholderIcon';

export default function EntityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useGetEntityDetailQuery(id ?? '');

  return (
    <QueryGuard
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      errorMessage="Impossibile caricare i dati dell'ente."
    >
      {(resolvedData) => {
        const opportunities: EntityOpportunity[] =
          resolvedData.recentOpportunities.map((opp) => ({
            id: opp.id,
            title: opp.name,
            badgeLabel: formatBadgeLabel(opp.beneficiaryBenefit),
          }));

        const accessPoints: PlaceDetailRelatedItem[] =
          resolvedData.recentPlaces.map((place) => ({
            id: place.id,
            title: place.name,
            address:
              place.street && place.city
                ? {
                    street: place.street,
                    city: place.city,
                    state: place.state ?? '',
                    postalCode: place.postalCode ?? '',
                  }
                : undefined,
          }));

        const contacts: EntityContacts = {
          phone: resolvedData.place.supportContacts.find(
            (c) => c.type === 'phone',
          )?.value,
          website:
            resolvedData.place.supportContacts.find((c) => c.type === 'website')
              ?.value ??
            resolvedData.place.website ??
            undefined,
          address: resolvedData.place.address
            ? `${resolvedData.place.address.street}, ${resolvedData.place.address.city}`
            : undefined,
        };

        return (
          <Box
            sx={{
              bgcolor: 'background.paper',
            }}
          >
            <PageHeader
              title={resolvedData.displayName}
              leadingContent={
                resolvedData.recentPlaces.length === 0 ? (
                  <EntityPlaceholderIcon />
                ) : undefined
              }
            />

            <Stack spacing={2} sx={{ mt: 2, mb: 4 }}>
              <ItemsSection
                variant="opportunity"
                entityId={id ?? ''}
                items={opportunities}
              />
              <ItemsSection
                variant="access-point"
                entityId={id ?? ''}
                items={accessPoints}
              />
              <ContactsSection contacts={contacts} />
            </Stack>
          </Box>
        );
      }}
    </QueryGuard>
  );
}

import { TheaterComedyOutlined } from '@mui/icons-material';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Box, Button, Divider, Link, Stack, useTheme } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import { useNavigate, useParams } from 'react-router-dom';
import {
  toEntityAccessPointDetailRoute,
  toEntityDetailRoute,
} from '../../app/routeConfig';
import {
  DiscoveryListItem,
  PageHeader,
  QueryGuard,
  SectionTitle,
} from '../../components/index.js';
import { PageErrorType } from '../../components/QueryGuard/ErrorScreen/types.js';
import { useGetOpportunityDetailQuery } from '../../features/opportunities/api.js';
import { formatAddress } from '../../utils/formatAddress.js';
import { formatBadgeLabel } from '../../utils/formatBadgeLabel.js';

function formatPlacesAddress(venue: {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
}): string {
  return [venue.street, venue.city, venue.state, venue.postal_code]
    .filter(Boolean)
    .join(', ');
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data, isLoading, isError, error, refetch } =
    useGetOpportunityDetailQuery(id ?? '');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const categoryLabel = (category: string) => category.toUpperCase();

  return (
    <QueryGuard
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      errorType={PageErrorType.OPPORTUNITY_NOT_FOUND}
      reloadAction={refetch}
    >
      {(resolvedData) => (
        <Box
          sx={{
            minHeight: '100dvh',
            bgcolor: 'background.paper',
          }}
        >
          <PageHeader
            leadingContent={
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '999px',
                  bgcolor: '#D5F4F4',
                  color: '#0B515D',
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1,
                  mb: 2,
                }}
              >
                {formatBadgeLabel(resolvedData.beneficiaryBenefit)}
              </Box>
            }
            title={resolvedData.name}
            subtitle={
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.25,
                  border: '1px solid #D7DCE8',
                  mb: 2,
                }}
              >
                <TheaterComedyOutlined
                  sx={{ fontSize: 16, color: '#98A2B3' }}
                />
                <Body fontWeight="Semibold" fontSize={'12px'}>
                  {categoryLabel(resolvedData.category)}
                </Body>
              </Box>
            }
          />
          <Stack spacing={0} sx={{ px: 2, mb: 4 }}>
            <Box sx={{ py: 2 }}>
              <Body fontWeight="Light" fontSize="14px">
                Descrizione
              </Body>
              <Body fontWeight="Semibold">{resolvedData.description}</Body>
            </Box>
            <Divider />
            {resolvedData.condition && (
              <>
                <Box sx={{ py: 2 }}>
                  <Body fontWeight="Light" fontSize="14px">
                    Condizioni
                  </Body>
                  <Body fontWeight="Semibold">{resolvedData.condition}</Body>
                </Box>
                <Divider />
              </>
            )}

            {resolvedData.caregiverBenefit?.value && (
              <>
                <Box sx={{ py: 2 }}>
                  <Body fontWeight="Light" fontSize="14px">
                    Accompagnatore
                  </Body>
                  <Body fontWeight="Semibold">
                    Stesse condizioni del titolare
                  </Body>
                </Box>
                <Divider />
              </>
            )}

            <Box sx={{ py: 2 }}>
              <Body fontWeight="Light" fontSize="14px">
                Periodo di validità
              </Body>
              <Body fontWeight="Semibold">
                {formatDate(resolvedData.dateTo ?? resolvedData.dateFrom)}
              </Body>
            </Box>
            <Divider />

            {resolvedData.url && (
              <Box sx={{ py: 2.25 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <OpenInNewOutlinedIcon
                    sx={{
                      color: theme.palette.common.primaryButton,
                      fontSize: 20,
                    }}
                  />
                  <Box>
                    <Body fontWeight="Regular" fontSize="14px">
                      Scopri di più
                    </Body>
                    <Link
                      href={resolvedData.url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        color: theme.palette.common.primaryButton,
                        fontSize: 16,
                        lineHeight: 1.35,
                        fontWeight: 600,
                        wordBreak: 'break-word',
                      }}
                    >
                      {resolvedData.url}
                    </Link>
                  </Box>
                </Box>
              </Box>
            )}

            <Box sx={{ mx: -3 }}>
              <SectionTitle label="Valida presso" />
              {resolvedData.places.map((place) => (
                <DiscoveryListItem
                  key={place.id}
                  variant="simple"
                  title={place.name}
                  subtitle={formatPlacesAddress(place)}
                  onClick={() =>
                    navigate(toEntityAccessPointDetailRoute(place.id))
                  }
                  sx={{ px: 0, bgcolor: 'background.paper' }}
                />
              ))}
            </Box>

            <Box sx={{ mx: -3, mt: 2 }}>
              <SectionTitle label="Gestita da" />
              <DiscoveryListItem
                variant="simple"
                title={resolvedData.profile.displayName}
                subtitle={
                  resolvedData.profile.place.website ??
                  formatAddress(resolvedData.profile.place.address)
                }
                onClick={() =>
                  navigate(toEntityDetailRoute(resolvedData.profile.id))
                }
                sx={{ px: 0, bgcolor: 'background.paper' }}
              />
            </Box>
          </Stack>

          <Box
            sx={{
              px: 2,
              pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                bgcolor: theme.palette.common.primaryButton,
                color: 'white',
                fontWeight: 600,
                borderRadius: '10px',
                fontSize: 16,
                textTransform: 'none',
              }}
            >
              Vai alla tua Carta
            </Button>
          </Box>
        </Box>
      )}
    </QueryGuard>
  );
}

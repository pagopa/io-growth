import { TheaterComedyOutlined } from '@mui/icons-material';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Box, Button, Divider, Link, Stack, useTheme } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { useTrackLandedInPage } from '../../mixpanel/useTrackLandedInPage.js';
import { useCallback } from 'react';
import { trackBrowserEvent } from '../../mixpanel/trackEvent.js';
import { OpportunityDetail } from '../../features/entities/types.js';
import { Place } from '../../core/api/generated/model/place.js';

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
  const location = useLocation();

  const state = location.state as { source: string };

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

  useTrackLandedInPage(
    'CED_OPPORTUNITY_DETAIL',
    {
      opportunity_name: data?.name ?? '',
      organizazion_name: data?.profile.displayName ?? '',
      organizazion_fiscal_code: '',
      location_name: data?.places[0].name ?? '',
      source: state.source,
    },
    !!data,
  );

  const handleGoToITWClick = useCallback(() => {
    //TODO add window.location.replace('deep-link-wallet')
    trackBrowserEvent('CED_GO_TO_ITW_CREDENTIAL', {
      opportunity_name: data?.name ?? '',
    });
  }, [data?.name]);

  const handleEntityClick = useCallback(
    (data: OpportunityDetail) => {
      trackBrowserEvent('CED_ORGANIZATION_SELECTED', {
        organization_name: data.profile.displayName,
        organization_fiscal_code: '',
      });
      navigate(toEntityDetailRoute(data.id));
    },
    [navigate],
  );

  const handleLocationClick = useCallback(
    ({
      name,
      profile,
      id: placeId,
    }: Place & Pick<OpportunityDetail, 'profile'>) => {
      // Some values from the search API are not yet available in the current response model.
      trackBrowserEvent('CED_LOCATION_SELECTED', {
        event_type: 'tap',
        organization_name: profile.displayName,
        organization_fiscal_code: '',
        location_name: name,
      });
      navigate(toEntityAccessPointDetailRoute(placeId));
    },
    [navigate],
  );

  return (
    <QueryGuard
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      errorType={PageErrorType.OPPORTUNITY_NOT_FOUND}
      firstAction={{
        label: 'Ricarica',
        onClick: refetch,
      }}
      secondAction={{
        label: 'Torna indietro',
        onClick: () => navigate(-1),
      }}
    >
      {(resolvedData) => (
        <Box
          sx={{
            minHeight: '100dvh',
            bgcolor: 'background.paper',
            // TODO: leave this prop and handle in UI-Core component
            overflowX: 'hidden',
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
                Inizio validità
              </Body>
              <Body fontWeight="Semibold">
                {formatDate(resolvedData.dateFrom)}
              </Body>
            </Box>
            <Divider />

            {resolvedData.dateTo && (
              <>
                <Box sx={{ py: 2 }}>
                  <Body fontWeight="Light" fontSize="14px">
                    Fine validità
                  </Body>
                  <Body fontWeight="Semibold">
                    {formatDate(resolvedData.dateTo)}
                  </Body>
                </Box>
                <Divider />
              </>
            )}

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
                      onClick={() =>
                        trackBrowserEvent('CED_OPPORTUNITY_WEBSITE', {
                          opportunity_name: data?.name ?? '',
                        })
                      }
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
                    handleLocationClick({
                      ...place,
                      profile: resolvedData.profile,
                    })
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
                onClick={() => handleEntityClick(resolvedData)}
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
              onClick={handleGoToITWClick}
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

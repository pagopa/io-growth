import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Place from '@mui/icons-material/Place';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import WebOutlined from '@mui/icons-material/WebOutlined';
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { MIChip } from '@pagopa/mui-italia';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { useToast } from '../../contexts';
import {
  useGetOpportunityDetailQuery,
  useUpdateOpportunityMutation,
} from '../../features/opportunities/api';
import type { OpportunityDetail } from '../../features/opportunities/types';
import { useGetPlacesByIdsQuery } from '../../features/places/api';
import { getApiErrorMessage } from '../CreateBenefit/hooks/useCreateOpportunity';
import { getDetailChipConfig } from '../Home/components/utils';
import { getOpportunityCategory } from '../../constants';
import { OpportunitiesCtas } from './components/OpportunitiesCtas/OpportunitiesCtas';
import { OpportunityAlert } from './components/OpportunityAlert/OpportunityAlert';
import { OpportunityDetailCard } from './components/OpportunityDetailCard';
import { OpportunityDetailListSection } from './components/OpportunityDetailListSection';

const EDITABLE_STATUSES: OpportunityDetail['status'][] = [
  'draft',
  'test_rejected',
  'test_passed',
  'scheduled',
  'published',
  'suspended',
];

export default function OpportunityDetailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: detail,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetOpportunityDetailQuery(id ?? '');
  const [updateOpportunity, { isLoading: isRemovingPlace }] =
    useUpdateOpportunityMutation();
  const { showToast } = useToast();
  const { data: places } = useGetPlacesByIdsQuery(detail?.placeIds ?? [], {
    skip: !detail?.placeIds || detail.placeIds.length === 0,
  });

  const locationIds = useMemo(
    () =>
      places?.filter(
        ({ id, type }) => type === 'offline' && detail?.placeIds.includes(id),
      ) ?? [],
    [detail?.placeIds, places],
  );

  const websiteIds = useMemo(
    () =>
      places?.filter(
        ({ id, type }) => type === 'online' && detail?.placeIds.includes(id),
      ) ?? [],
    [detail?.placeIds, places],
  );

  const canEdit = !!detail && EDITABLE_STATUSES.includes(detail.status);
  const hasLocation = !!detail?.nationalTerritory || locationIds.length > 0;
  const isOnlyLocation = locationIds.length === 1 && websiteIds.length === 0;
  const isOnlyWebsite = websiteIds.length === 1 && !hasLocation;
  const isRemoving = isRemovingPlace || isFetching;

  const hideLocationDelete = !canEdit || isOnlyLocation;
  const hideWebsiteDelete = !canEdit || isOnlyWebsite;

  const handleRemovePlace = useCallback(
    async (placeId: string) => {
      if (!detail) {
        return;
      }

      try {
        await updateOpportunity({
          id: detail.id,
          payload: {
            updatedAt: detail.updatedAt,
            dateFrom: detail.dateFrom,
            dateTo: detail.dateTo ?? undefined,
            url: detail.url ?? undefined,
            categoryId: detail.categoryId,
            nationalTerritory: detail.nationalTerritory,
            placeIds: detail.placeIds.filter((id) => id !== placeId),
            beneficiaryBenefit: detail.beneficiaryBenefit,
            caregiverBenefit: detail.caregiverBenefit ?? undefined,
            localizedMetadata: detail.localizedMetadata,
          },
        }).unwrap();
        showToast('Punto di accesso rimosso con successo', 'success');
      } catch (error) {
        showToast(
          getApiErrorMessage(error) ??
            'Errore durante la rimozione del punto di accesso',
          'error',
        );
      }
    },
    [detail, showToast, updateOpportunity],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100%',
          px: { xs: 2, md: 3.5 },
          py: { xs: 3, md: 4.5 },
        }}
        bgcolor={theme.palette.common.neutralGray}
      >
        <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
          <Skeleton variant="rounded" width={110} height={28} />
          <Stack spacing={1}>
            <Skeleton variant="text" width="55%" height={56} />
            <Skeleton variant="text" width="45%" height={32} />
          </Stack>
          <Skeleton variant="rounded" width="100%" height={140} />
          <Skeleton variant="rounded" width="100%" height={280} />
        </Stack>
      </Box>
    );
  }

  if (isError || !detail) {
    return (
      <Box
        sx={{
          minHeight: '100%',
          display: 'grid',
          placeItems: 'center',
          px: { xs: 2, md: 3.5 },
          py: { xs: 3, md: 4.5 },
        }}
        bgcolor={theme.palette.common.neutralGray}
      >
        <Stack spacing={1.5} alignItems="center">
          <WarningAmberRoundedIcon
            sx={{ color: 'text.secondary', fontSize: 28 }}
          />
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
          >
            Errore durante il caricamento
          </Typography>
          <Button variant="text" onClick={() => navigate(APP_ROUTES.HOME)}>
            Torna alla lista
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100%',
        px: { xs: 2, md: 3.5 },
        py: { xs: 3, md: 4.5 },
      }}
      bgcolor={theme.palette.common.neutralGray}
    >
      <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ alignSelf: 'flex-start', fontWeight: 600, pl: 0 }}
        >
          Indietro
        </Button>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box width="100%">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontSize: { xs: 28, md: 36 } }}
              >
                {getOpportunityCategory(detail.categoryLabel).title}
              </Typography>
              <MIChip
                {...getDetailChipConfig(detail)}
                sx={{
                  flexShrink: 0,
                  '& .MuiChip-label': {
                    whiteSpace: 'nowrap',
                  },
                }}
              />
            </Stack>
            <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 16 }}>
              Ecco i dettagli dell&apos;opportunità che hai creato
            </Typography>
          </Box>
        </Stack>

        <OpportunityAlert
          id={detail.id}
          status={detail.status}
          suspendFrom={detail.suspendFrom}
          suspensionMessage={detail.suspensionMessage}
          suspendedBy={detail.suspendedBy}
          changeRequestMessage={detail.changeRequestMessage}
          republishMessage={detail.republishMessage}
          republishRejectionMessage={detail.republishRejectionMessage}
          onCancelSuccess={refetch}
        />

        <OpportunityDetailCard detail={detail} />

        <OpportunityDetailListSection
          title="Sedi"
          icon={<Place sx={{ color: 'text.secondary', fontSize: 20 }} />}
          places={locationIds}
          nationalTerritory={detail.nationalTerritory}
          hideDelete={hideLocationDelete}
          onRemove={handleRemovePlace}
          isRemoving={isRemoving}
        />

        <OpportunityDetailListSection
          title="Siti web"
          icon={<WebOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />}
          places={websiteIds}
          hideDelete={hideWebsiteDelete}
          onRemove={handleRemovePlace}
          isRemoving={isRemoving}
        />

        <Stack
          component={Paper}
          p={3}
          borderRadius={2}
          elevation={0}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
            Codice ID
          </Typography>
          <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
            {detail.id}
          </Typography>
        </Stack>

        <OpportunitiesCtas
          status={detail.status}
          id={detail.id}
          suspendFrom={detail.suspendFrom}
          suspendedBy={detail.suspendedBy}
          republishMessage={detail.republishMessage}
        />
      </Stack>
    </Box>
  );
}

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import WarningIcon from '@mui/icons-material/WarningRounded';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useApproveOpportunityMutation,
  useAdminCancelScheduledSuspensionMutation,
  useAdminSuspendOpportunityMutation,
  useGetAdminOpportunityDetailQuery,
} from '../../features/opportunities/api';
import { APP_ROUTES } from '../../app/routeConfig';
import { useToast } from '../../contexts';
import { PublishModal } from '../../components/PublishModal';
import { RequestChangesModal } from '../../components/RequestChangesModal';
import { OpportunityDetailCard } from './components/OpportunityDetailCard';
import { STATE_COLORS, STATE_OPTIONS } from '../../constants/opportunityState';
import { SuspendOpportunityModal } from '../../components/SuspendOpportunityModal';
import type { SuspendOpportunityPayload } from '../../features/opportunities/types';

export default function OpportunityDetailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useGetAdminOpportunityDetailQuery(id ?? '');
  const [approveOpportunity, { isLoading: isApproving }] =
    useApproveOpportunityMutation();
  const [suspendOpportunity, { isLoading: isSuspending }] =
    useAdminSuspendOpportunityMutation();
  const [cancelScheduledSuspension, { isLoading: isCancelingSuspension }] =
    useAdminCancelScheduledSuspensionMutation();
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);

  const detailStatus = detail?.status;
  const detailSuspendFrom = detail?.suspendFrom;
  const formattedSuspendFrom = detailSuspendFrom?.trim()
    ? format(parseISO(detailSuspendFrom), 'dd/MM/yyyy')
    : null;
  const hasScheduledSuspension =
    detailStatus === 'scheduled_suspension' ||
    (detailStatus === 'published' && Boolean(detailSuspendFrom));
  const canSuspendOpportunity =
    detailStatus === 'published' && !hasScheduledSuspension;

  const handleSuspend = async (payload: SuspendOpportunityPayload) => {
    if (!id || isSuspending) {
      return;
    }

    try {
      await suspendOpportunity({ id, payload }).unwrap();
      setSuspendModalOpen(false);
      showToast('Sospensione impostata con successo', 'success');
    } catch {
      showToast("Errore durante la sospensione dell'opportunità", 'error');
    }
  };

  const handleCancelSuspension = async () => {
    if (!id || isCancelingSuspension) {
      return;
    }

    try {
      await cancelScheduledSuspension({ id }).unwrap();
      await refetch();
      showToast('Sospensione programmata annullata con successo', 'success');
    } catch {
      showToast("Errore durante l'annullamento della sospensione", 'error');
    }
  };

  if (isLoading) {
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
        <Stack spacing={1} alignItems="center">
          <CircularProgress size={28} />
          <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
            Caricamento dettagli...
          </Typography>
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
          <Button
            variant="text"
            onClick={() => navigate(APP_ROUTES.OPPORTUNITIES)}
          >
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
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, fontSize: { xs: 28, md: 36 } }}
            >
              {detail.categoryTitle}
            </Typography>
            <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 16 }}>
              Ecco i dettagli dell&apos;opportunità
            </Typography>
          </Box>
          <Chip
            label={
              STATE_OPTIONS.find((o) => o.value === detail.status)?.label ??
              detail.status
            }
            color={STATE_COLORS[detail.status] ?? 'default'}
            size="small"
          />
        </Stack>

        {hasScheduledSuspension && formattedSuspendFrom && (
          <Box
            sx={{
              borderRadius: '8px',
              pt: 2.5,
              pb: 1,
              px: 2,
              border: (theme) =>
                `1px solid ${theme.palette.common.alertWarningBorder}`,
              backgroundColor: (theme) => theme.palette.common.alertWarningBg,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <WarningIcon
                  sx={{
                    color: (theme) => theme.palette.common.alertWarningText,
                    fontSize: 24,
                    mt: 0.25,
                  }}
                />
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 18,
                      color: (theme) => theme.palette.common.alertWarningText,
                    }}
                  >
                    {`L'opportunità sarà sospesa dal ${formattedSuspendFrom}`}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      color: (theme) => theme.palette.common.alertWarningText,
                    }}
                  >
                    {detail.suspensionMessage?.trim() || '-'}
                  </Typography>
                  <Button
                    variant="text"
                    disableRipple
                    onClick={handleCancelSuspension}
                    sx={{
                      alignSelf: 'flex-start',
                      px: 0,
                      minWidth: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: (theme) => theme.palette.common.alertWarningText,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    Annulla sospensione
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        )}

        <OpportunityDetailCard detail={detail} />

        {detail.status === 'test_pending' && (
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ pt: 2, pb: 4 }}
          >
            <Button
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={() => setRequestChangesOpen(true)}
              sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              Richiedi modifiche
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setPublishModalOpen(true)}
              sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
            >
              Pubblica
            </Button>
          </Stack>
        )}

        {canSuspendOpportunity && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="flex-end"
            sx={{ pt: 2, pb: 4 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSuspendModalOpen(true)}
              disabled={isSuspending}
              sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
            >
              Sospendi
            </Button>
          </Stack>
        )}
      </Stack>

      <PublishModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={async () => {
          if (!id || isApproving) {
            return;
          }

          try {
            await approveOpportunity({
              id,
              payload: detail?.dateFrom
                ? { dateFrom: detail.dateFrom }
                : undefined,
            }).unwrap();
            setPublishModalOpen(false);
            navigate(APP_ROUTES.OPPORTUNITIES);
            showToast('Opportunità approvata con successo', 'success');
          } catch {
            showToast(
              "Errore durante l'approvazione dell'opportunità",
              'error',
            );
          }
        }}
        count={1}
        publishDate={detail?.dateFrom}
      />

      <RequestChangesModal
        open={requestChangesOpen}
        onClose={() => setRequestChangesOpen(false)}
        onConfirm={() => {
          setRequestChangesOpen(false);
          navigate(APP_ROUTES.OPPORTUNITIES);
          showToast('Fatto!', 'success');
        }}
      />

      <SuspendOpportunityModal
        open={suspendModalOpen}
        isLoading={isSuspending}
        onClose={() => setSuspendModalOpen(false)}
        onConfirm={handleSuspend}
      />
    </Box>
  );
}

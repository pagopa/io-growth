import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Box,
  Button,
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
  useAdminRepublishOpportunityMutation,
  useAdminRejectOpportunityRepublishMutation,
  useAdminSuspendOpportunityMutation,
  useGetAdminOpportunityDetailQuery,
  useRequestOpportunityChangesMutation,
} from '../../features/opportunities/api';
import { APP_ROUTES } from '../../app/routeConfig';
import { useToast } from '../../contexts';
import { PublishModal } from '../../components/PublishModal';
import { RequestChangesModal } from '../../components/RequestChangesModal';
import { OpportunityDetailCard } from './components/OpportunityDetailCard';
import { STATE_COLORS, STATE_OPTIONS } from '../../constants/opportunityState';
import { SuspendOpportunityModal } from '../../components/SuspendOpportunityModal';
import { RejectOpportunityRepublishModal } from '../Home/components/OpportunityActionModal';
import type {
  RejectOpportunityRepublishPayload,
  SuspendOpportunityPayload,
} from '../../features/opportunities/types';
import { MIAlert, MIChip } from '@pagopa/mui-italia';

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
  const [republishOpportunity, { isLoading: isRepublishing }] =
    useAdminRepublishOpportunityMutation();
  const [rejectOpportunityRepublish, { isLoading: isRejectingRepublish }] =
    useAdminRejectOpportunityRepublishMutation();
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [republishModalOpen, setRepublishModalOpen] = useState(false);
  const [rejectRepublishModalOpen, setRejectRepublishModalOpen] =
    useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [requestOpportunityChanges, { isLoading: isRequestingChanges }] =
    useRequestOpportunityChangesMutation();

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
  const canRepublishOpportunity = detailStatus === 'suspended';

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

  const handleRepublish = async () => {
    if (!id || isRepublishing) {
      return;
    }

    try {
      await republishOpportunity(id).unwrap();
      setRepublishModalOpen(false);
      showToast(
        detail?.republishMessage?.trim()
          ? 'Richiesta di ripubblicazione approvata'
          : 'Opportunità ripubblicata con successo',
        'success',
      );
    } catch {
      showToast("Errore durante la ripubblicazione dell'opportunità", 'error');
    }
  };

  const handleRejectRepublish = async (
    payload: RejectOpportunityRepublishPayload,
  ) => {
    if (!id || isRejectingRepublish) {
      return false;
    }

    try {
      await rejectOpportunityRepublish({ id, payload }).unwrap();
      setRejectRepublishModalOpen(false);
      await refetch();
      showToast('Richiesta di ripubblicazione rifiutata', 'success');
      return true;
    } catch {
      showToast(
        'Errore durante il rifiuto della richiesta di ripubblicazione',
        'error',
      );
      return false;
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
          <MIChip
            label={
              STATE_OPTIONS.find((o) => o.value === detail.status)?.label ??
              detail.status
            }
            color={STATE_COLORS[detail.status] ?? 'default'}
          />
        </Stack>

        {(detail.status === 'draft' || detail.status === 'test_rejected') &&
          detail.changeRequestMessage?.trim() && (
            <MIAlert severity="warning">
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                Hai richiesto delle modifiche all&apos;ente
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 16,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {detail.changeRequestMessage.trim()}
              </Typography>
            </MIAlert>
          )}

        {detail.republishMessage?.trim() && (
          <MIAlert severity="info">
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
              Richiesta di ripubblicazione dell’ente
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 16 }}>
              {detail.republishMessage.trim()}
            </Typography>
          </MIAlert>
        )}

        {hasScheduledSuspension && formattedSuspendFrom && (
          <MIAlert severity="warning">
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
              {`L'opportunità sarà sospesa dal ${formattedSuspendFrom}`}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 16 }}>
              {detail.suspensionMessage?.trim() || '-'}
            </Typography>
            <Button
              variant="text"
              onClick={handleCancelSuspension}
              sx={{ px: 0, minWidth: 0, fontWeight: 700 }}
            >
              Annulla sospensione programmata
            </Button>
          </MIAlert>
        )}

        {detail.status === 'suspended' && detail.suspendedBy && (
          <MIAlert severity="warning">
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
              {detail.suspendedBy === 'department'
                ? "Hai sospeso l'opportunità"
                : "L'opportunità è stata sospesa dall'ente"}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 16 }}>
              {detail.suspensionMessage?.trim() || '-'}
            </Typography>
          </MIAlert>
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
        {canRepublishOpportunity && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="flex-end"
            sx={{ pt: 2, pb: 4 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setRepublishModalOpen(true)}
              disabled={isRepublishing}
              sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
            >
              {detail.republishMessage?.trim()
                ? 'Approva richiesta'
                : 'Ripubblica'}
            </Button>
            {detail.republishMessage?.trim() && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setRejectRepublishModalOpen(true)}
                disabled={isRejectingRepublish}
                sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
              >
                Rifiuta richiesta
              </Button>
            )}
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

      <PublishModal
        open={republishModalOpen}
        onClose={() => setRepublishModalOpen(false)}
        onPublish={handleRepublish}
        count={1}
        description={
          detail.republishMessage?.trim()
            ? 'Accettando la richiesta, l’opportunità sarà pubblicata di nuovo su IO e l’ente riceverà una comunicazione.'
            : "Invieremo un'email all'ente per informarlo. L'opportunità sarà di nuovo disponibile su IO."
        }
        title={
          detail.republishMessage?.trim()
            ? 'Approva la richiesta di ripubblicazione'
            : 'Ripubblica su IO'
        }
        actionLabel={
          detail.republishMessage?.trim() ? 'Approva richiesta' : 'Conferma'
        }
        isLoading={isRepublishing}
      />

      <RejectOpportunityRepublishModal
        open={rejectRepublishModalOpen}
        onClose={() => setRejectRepublishModalOpen(false)}
        onConfirm={handleRejectRepublish}
        isLoading={isRejectingRepublish}
      />

      <RequestChangesModal
        open={requestChangesOpen}
        isLoading={isRequestingChanges}
        onClose={() => setRequestChangesOpen(false)}
        onConfirm={async (changeRequestMessage) => {
          if (!id || isRequestingChanges) {
            return false;
          }

          try {
            await requestOpportunityChanges({
              id,
              payload: { changeRequestMessage },
            }).unwrap();
            setRequestChangesOpen(false);
            navigate(APP_ROUTES.OPPORTUNITIES);
            showToast('Fatto!', 'success');
            return true;
          } catch {
            showToast(
              "Errore durante l'invio della richiesta di modifiche",
              'error',
            );
            return false;
          }
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

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { UploadDropzone, UploadState } from '../../components';
import {
  ENTITY_STATE_COLORS,
  ENTITY_STATE_OPTIONS,
} from '../../constants/opportunityState';
import { useToast } from '../../contexts';
import {
  useCompleteOnboardingMutation,
  useGetContractSignedMutation,
  useGetDepartmentOnboardingQuery,
} from '../../features/entities/api';
import { DetailSection } from '../OpportunityDetail/components/DetailSection';
import { PublishEntityModal } from './components/PublishEntityModal';
import { RejectEntityModal } from './components/RejectEntityModal';
import { SectionCard } from './components/SectionCard.js';
import {
  getEntityFields,
  getEntityName,
  getGeographicFields,
  getLegalRepresentativeFields,
} from './utils.js';

export default function EntityDetailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: onboarding,
    isLoading,
    isError,
    refetch,
  } = useGetDepartmentOnboardingQuery(id ?? skipToken);
  const [getContractSigned, { isLoading: isDownloadingContract }] =
    useGetContractSignedMutation();
  const [completeOnboarding, { isLoading: isCompletingOnboarding }] =
    useCompleteOnboardingMutation();

  const { showToast } = useToast();

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [openPublishModal, setOpenPublishModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  const handleDownloadContract = async () => {
    if (!id) {
      return;
    }

    try {
      const blob = await getContractSigned({ onboardingId: id }).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contratto-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Errore durante il download del contratto', 'error');
    }
  };

  const handleApprove = async () => {
    if (!id || !uploadedFile) {
      return;
    }

    try {
      await completeOnboarding({
        onboardingId: id,
        contract: uploadedFile,
      }).unwrap();
      setOpenPublishModal(false);
      showToast('Ente approvato con successo', 'success');
      navigate(APP_ROUTES.ENTITIES);
    } catch {
      showToast('Errore durante l’approvazione della richiesta', 'error');
    }
  };

  const handlePublish = () => {
    if (!uploadedFile || uploadState !== 'success') {
      showToast(
        'Carica la richiesta di convenzionamento controfirmata prima di approvare',
        'error',
      );
      return;
    }
    setOpenPublishModal(true);
  };

  const entityName = getEntityName(onboarding);
  const entityFields = getEntityFields(onboarding);
  const geographicFields = getGeographicFields(onboarding);
  const legalRepresentativeFields = getLegalRepresentativeFields(onboarding);

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

  if (isError || !onboarding) {
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
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <WarningAmberRoundedIcon
            sx={{ color: 'text.secondary', fontSize: 28 }}
          />
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}
          >
            Errore durante il caricamento
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="text"
              onClick={() => navigate(APP_ROUTES.ENTITIES)}
            >
              Torna alla lista
            </Button>
            <Button variant="text" onClick={() => refetch()}>
              Riprova
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  const isEditable = onboarding.status === 'PENDING_IN_REVIEW';

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
          onClick={() => navigate(APP_ROUTES.ENTITIES)}
          sx={{ alignSelf: 'flex-start', fontWeight: 600, pl: 0 }}
        >
          Indietro
        </Button>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, fontSize: { xs: 28, md: 36 } }}
            >
              Richiesta di convenzionamento
            </Typography>
            <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 16 }}>
              Ecco i dettagli della richiesta di convenzionamento di{' '}
              {entityName}.
            </Typography>
          </Box>
          <Chip
            label={
              ENTITY_STATE_OPTIONS.find(
                (option) => option.value === onboarding.status,
              )?.label ?? onboarding.status
            }
            color={ENTITY_STATE_COLORS[onboarding.status ?? ''] ?? 'default'}
            size="small"
          />
        </Stack>
        <SectionCard title="Dati dell'ente">
          <DetailSection fields={entityFields} />
          <Box sx={{ py: 2, px: 3 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 1,
                color: 'text.secondary',
              }}
            >
              AREA GEOGRAFICA
            </Typography>
          </Box>
          <DetailSection fields={geographicFields} />
        </SectionCard>
        <SectionCard title="Dati del Legale Rappresentante">
          <DetailSection fields={legalRepresentativeFields} />
        </SectionCard>
        <SectionCard title="Convenzione">
          <Box sx={{ py: 2, px: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {isEditable
                    ? 'Richiesta di convenzionamento'
                    : 'Richiesta di convenzionamento controfirmata'}
                </Typography>

                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                  contratto-{onboarding.id}.pdf
                </Typography>
              </Box>

              <Button
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={handleDownloadContract}
                disabled={isDownloadingContract}
              >
                {isDownloadingContract
                  ? 'Download in corso...'
                  : isEditable
                    ? 'Scarica e firma'
                    : 'Scarica'}
              </Button>
            </Stack>
          </Box>

          {isEditable && <Divider sx={{ ml: 3, mr: 3 }} />}

          <Box sx={{ py: 2, px: 3 }}>
            {isEditable && (
              <>
                <UploadDropzone
                  title="Trascina qui la richiesta di convenzionamento controfirmata"
                  subtitle="Formato PDF"
                  onFileSelect={(file) => {
                    if (file) {
                      setUploadedFile(file);
                      setUploadState('success');
                    } else {
                      setUploadedFile(null);
                      setUploadState('idle');
                    }
                  }}
                  isLoading={
                    uploadState === 'loading' || isCompletingOnboarding
                  }
                  isError={uploadState === 'error'}
                  isSuccess={uploadState === 'success'}
                  uploadedFileName={uploadedFile?.name}
                  uploadedFileLabel="Richiesta di convenzionamento controfirmata"
                  onRetry={() => setUploadState('idle')}
                  onDelete={() => {
                    setUploadedFile(null);
                    setUploadState('idle');
                  }}
                  onCancel={() => setUploadState('idle')}
                  acceptedTypes={['application/pdf']}
                />

                <Typography
                  variant="body2"
                  sx={{ mt: 3, mb: 3, fontWeight: 600, color: 'error.dark' }}
                >
                  * Campo obbligatorio
                </Typography>
              </>
            )}
          </Box>
        </SectionCard>
        {isEditable && (
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ pt: 2 }}
          >
            <Button
              variant="outlined"
              color="error"
              sx={{ borderRadius: 2, px: 3 }}
              onClick={() => setOpenRejectModal(true)}
            >
              Rifiuta
            </Button>
            <Button
              variant="contained"
              sx={{ borderRadius: 2, px: 4 }}
              onClick={handlePublish}
            >
              Approva
            </Button>

            <RejectEntityModal
              open={openRejectModal}
              onClose={() => setOpenRejectModal(false)}
              onConfirm={() => {
                setOpenRejectModal(false);
                navigate(APP_ROUTES.ENTITIES);
                showToast('Fatto', 'success');
              }}
              entityName={entityName}
              productName={onboarding.productId ?? '-'}
            />
            <PublishEntityModal
              open={openPublishModal}
              onClose={() => setOpenPublishModal(false)}
              onPublish={handleApprove}
              isLoading={isCompletingOnboarding}
            />
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

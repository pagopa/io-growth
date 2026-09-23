import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { MIChip } from '@pagopa/mui-italia';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { UploadDropzone } from '../../components';
import {
  ENTITY_STATE_COLORS,
  ENTITY_STATE_OPTIONS,
} from '../../constants/opportunityState';
import { DetailSection } from '../OpportunityDetail/components/DetailSection';
import { PublishEntityModal } from './components/PublishEntityModal';
import { RejectEntityModal } from './components/RejectEntityModal';
import { SectionCard } from './components/SectionCard.js';
import useEntityDetail from './hooks/useEntityDetail.js';

export default function EntityDetailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    entity: {
      onboarding,
      name: entityName,
      fields: entityFields,
      geographicFields,
      legalRepresentativeFields,
      isEditable,
    },
    upload: {
      state: uploadState,
      setState: setUploadState,
      file: uploadedFile,
      setFile: setUploadedFile,
    },
    actions: {
      downloadContract: handleDownloadContract,
      approve: handleApprove,
      publish: handlePublish,
      reject: handleReject,
      refetch,
    },
    modals: {
      publish: { open: openPublishModal, setOpen: setOpenPublishModal },
      reject: { open: openRejectModal, setOpen: setOpenRejectModal },
    },
    status: {
      isLoading,
      isError,
      isDownloadingContract,
      isCompletingOnboarding,
      isRejectingOnboarding,
    },
  } = useEntityDetail();

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
          <MIChip
            label={
              ENTITY_STATE_OPTIONS.find(
                (option) => option.value === onboarding.status,
              )?.label ?? onboarding.status
            }
            color={ENTITY_STATE_COLORS[onboarding.status ?? ''] ?? 'default'}
          />
        </Stack>
        {onboarding.status === 'REJECTED' && (
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              bgcolor: 'rgba(211, 47, 47, 0.04)',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: 'error.main', mb: 0.5 }}
            >
              Esito del rifiuto
            </Typography>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
              La richiesta di convenzionamento è stata rifiutata.
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {onboarding.reasonForReject ||
                'La motivazione del rifiuto non è stata specificata.'}
            </Typography>
          </Box>
        )}

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

          {isEditable && (
            <>
              <Divider sx={{ ml: 3, mr: 3 }} />
              <Box sx={{ py: 2, px: 3 }}>
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
                    sx={{
                      mt: 3,
                      mb: 3,
                      fontWeight: 600,
                    }}
                    color="common.requiredField"
                  >
                    * Campo obbligatorio
                  </Typography>
                </>
              </Box>
            </>
          )}
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
              onConfirm={handleReject}
              entityName={entityName}
              productName={onboarding.productId ?? '-'}
              isLoading={isRejectingOnboarding}
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

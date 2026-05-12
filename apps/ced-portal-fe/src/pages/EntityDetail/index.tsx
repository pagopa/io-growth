import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { DownloadItem, UploadDropzone, UploadState } from '../../components';
import {
  ENTITY_STATE_COLORS,
  ENTITY_STATE_OPTIONS,
} from '../../constants/opportunityState';
import { useToast } from '../../contexts';
import { useGetEntityDetailQuery } from '../../features/entities/api';
import { DetailSection } from '../OpportunityDetail/components/DetailSection';
import { PublishEntityModal } from './components/PublishEntityModal';
import { RejectEntityModal } from './components/RejectEntityModal';

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

const SectionCard = ({ title, children }: SectionCardProps) => {
  return (
    <Accordion defaultExpanded elevation={0} sx={{ borderRadius: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon color="primary" />}
        sx={{ px: 3, py: 1 }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default function EntityDetailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useGetEntityDetailQuery(id ?? '');

  const { showToast } = useToast();

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [openPublishModal, setOpenPublishModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const handlePublish = () => {
    if (!uploadedFile) {
      showToast(
        'Carica la richiesta di convenzionamento controfirmata prima di approvare',
        'error',
      );
      return;
    }
    setOpenPublishModal(true);
  };

  const entityFields = detail
    ? [
        { label: 'Prodotto', value: detail.product },
        {
          label: 'Tipologia di soggetto aderente',
          value: detail.adherent_type,
        },
        { label: 'Ragione sociale', value: detail.business_name },
        { label: 'Sede legale', value: detail.legal_headquarters },
        { label: 'CAP', value: detail.cap },
        { label: 'Email PEC', value: detail.pec_email },
        { label: 'Partita IVA', value: detail.vat_number },
        { label: 'La P IVA e di gruppo', value: detail.is_group_vat },
        { label: 'Codice SDI', value: detail.sdi_code },
        {
          label: 'Luogo di iscrizione al Registro delle Imprese',
          value: detail.business_registry_place,
        },
        { label: 'REA (facoltativo)', value: detail.rea },
        {
          label: 'Indirizzo email visibile ai cittadini',
          value: detail.public_email,
        },
      ]
    : [];

  const geographicFields = detail
    ? [
        {
          label: 'Area di competenza',
          value: detail.geographic.competence_area,
        },
        {
          label: 'Area geografica',
          value: detail.geographic.areas.join(', '),
        },
      ]
    : [];

  const legalRepresentativeFields = detail
    ? [
        {
          label: 'Nome e cognome',
          value: detail.legal_representative.full_name,
        },
        {
          label: 'Indirizzo email',
          value: detail.legal_representative.email,
        },
        {
          label: 'Numero di telefono',
          value: detail.legal_representative.phone,
        },
      ]
    : [];

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
              {detail.name}.
            </Typography>
          </Box>
          <Chip
            label={
              ENTITY_STATE_OPTIONS.find(
                (option) => option.value === detail.state,
              )?.label ?? detail.state
            }
            color={ENTITY_STATE_COLORS[detail.state] ?? 'default'}
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
            <DownloadItem
              label="Richiesta di convenzionamento"
              fileName={detail.convention.request_file.name}
              downloadUrl={detail.convention.request_file.url}
            />
          </Box>
          <Divider sx={{ ml: 3, mr: 3 }} />
          <Box sx={{ py: 2, px: 3 }}>
            <UploadDropzone
              title="Trascina qui la richiesta di convenzionamento controfirmata"
              subtitle="Dimensione massima 300 x 300px - Formato PDF"
              onFileSelect={(file) => {
                if (file) {
                  setUploadState('loading');
                  // Simulate upload...
                  setTimeout(() => {
                    setUploadedFile(file.name);
                    setUploadState('success');
                  }, 2000);
                }
              }}
              isLoading={uploadState === 'loading'}
              isError={uploadState === 'error'}
              isSuccess={uploadState === 'success'}
              uploadedFileName={uploadedFile || undefined}
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
          </Box>
        </SectionCard>
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
            detail={detail}
          />
          <PublishEntityModal
            open={openPublishModal}
            onClose={() => setOpenPublishModal(false)}
            onPublish={() => {
              navigate(APP_ROUTES.ENTITIES);
              showToast('Ente pubblicato con successo', 'success');
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

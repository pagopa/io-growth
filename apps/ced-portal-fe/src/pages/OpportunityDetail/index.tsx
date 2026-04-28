import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetOpportunityDetailQuery } from '../../features/opportunities/api';
import { APP_ROUTES } from '../../app/routeConfig';
import { useToast } from '../../contexts';
import { PublishModal } from '../../components/PublishModal';
import { RequestChangesModal } from '../../components/RequestChangesModal';
import { OpportunityDetailCard } from './components/OpportunityDetailCard';

const STATE_LABELS: Record<string, string> = {
  Da_gestire: 'Da gestire',
  In_attesa_di_modifiche: 'In attesa di modifiche',
  Approvata: 'Approvata',
  Non_attiva: 'Non attiva',
};

const STATE_COLORS: Record<
  string,
  'default' | 'warning' | 'success' | 'info' | 'error'
> = {
  Da_gestire: 'warning',
  In_attesa_di_modifiche: 'info',
  Approvata: 'success',
  Non_attiva: 'default',
};

export default function OpportunityDetailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const {
    data: detail,
    isLoading,
    isError,
  } = useGetOpportunityDetailQuery(id ?? '');
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);

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
          onClick={() => navigate(APP_ROUTES.OPPORTUNITIES)}
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
              {detail.name}
            </Typography>
            <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 16 }}>
              Ecco i dettagli dell&apos;opportunità proposta da{' '}
              {detail.organization_name}
            </Typography>
          </Box>
          <Chip
            label={STATE_LABELS[detail.state] ?? detail.state}
            color={STATE_COLORS[detail.state] ?? 'default'}
            size="small"
          />
        </Stack>

        <OpportunityDetailCard detail={detail} />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
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
      </Stack>

      <PublishModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={() => {
          setPublishModalOpen(false);
        }}
        count={1}
        publishDate={
          detail?.validity_start
            ? new Date(detail.validity_start).toLocaleDateString('it-IT')
            : undefined
        }
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
    </Box>
  );
}

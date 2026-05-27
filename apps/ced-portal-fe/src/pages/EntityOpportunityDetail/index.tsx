import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WebOutlined from '@mui/icons-material/WebOutlined';
import Place from '@mui/icons-material/Place';
import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetOpportunityDetailQuery } from '../../features/opportunities/api';
import { APP_ROUTES } from '../../app/routeConfig';
import { OpportunityDetailCard } from './components/OpportunityDetailCard';
import { getDetailChipConfig } from '../Home/components/utils';
import { OpportunitiesCtas } from './components/OpportunitiesCtas/OpportunitiesCtas';
import { OpportunityAlert } from './components/OpportunityAlert/OpportunityAlert';
import { OpportunityDetailListSection } from './components/OpportunityDetailListSection';
import { PLACES, WEBSITES } from './components/constants';

export default function OpportunityDetailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: detail,
    isLoading,
    isError,
  } = useGetOpportunityDetailQuery(id ?? '');

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
            <Stack direction="row" alignItems="center">
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontSize: { xs: 28, md: 36 } }}
              >
                {detail.name}
              </Typography>
              <Chip
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

        <OpportunityAlert status={detail.publication_status} />

        <OpportunityDetailCard detail={detail} />

        <OpportunityDetailListSection
          title="Sedi"
          icon={<Place sx={{ color: 'text.secondary', fontSize: 20 }} />}
          rows={PLACES}
        />

        <OpportunityDetailListSection
          title="Siti web"
          icon={<WebOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />}
          rows={WEBSITES}
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

        <OpportunitiesCtas status={detail.publication_status} id={detail.id} />
      </Stack>
    </Box>
  );
}

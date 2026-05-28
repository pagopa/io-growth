import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';

const REDIRECT_DELAY_MS = 2000;

export default function CardRequestLoadingPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      navigate(APP_ROUTES.CARD_REQUEST_FLOW, { replace: true });
    }, REDIRECT_DELAY_MS);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: theme.palette.common.neutralGray,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
      }}
    >
      <CircularProgress size={40} thickness={5} />
      <Typography
        component="h1"
        sx={{
          mt: 6,
          textAlign: 'center',
          color: theme.palette.common.neutralBlack,
          fontSize: '24px',
          lineHeight: '36px',
          fontWeight: 600,
          letterSpacing: '0px',
        }}
      >
        Attendi qualche secondo
      </Typography>
    </Box>
  );
}

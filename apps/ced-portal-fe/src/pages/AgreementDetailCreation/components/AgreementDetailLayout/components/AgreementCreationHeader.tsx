import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../../../app/routeConfig';

export function AgreementCreationHeader() {
  const navigate = useNavigate();

  return (
    <Stack spacing={1.25}>
      <Button
        variant="text"
        color="primary"
        startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} />}
        sx={{ width: 'fit-content', px: 0 }}
        onClick={() => navigate(APP_ROUTES.HOME)}
      >
        Esci
      </Button>

      <Typography variant="h3" sx={{ fontWeight: 700, fontSize: 34 }}>
        Crea agevolazione
      </Typography>

      <Typography sx={{ color: 'text.secondary', fontSize: 16 }}>
        Compila i campi per aggiungere un&apos;agevolazione e inviarla in
        revisione. Una volta approvata, sara pubblicata su IO.
      </Typography>

      <Typography sx={{ color: 'error.main', fontSize: 14 }}>
        * Campo obbligatorio
      </Typography>
    </Stack>
  );
}

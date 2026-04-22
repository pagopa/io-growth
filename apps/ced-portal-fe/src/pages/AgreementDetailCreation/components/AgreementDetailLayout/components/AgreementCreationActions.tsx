import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveAltRoundedIcon from '@mui/icons-material/SaveAltRounded';
import { Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../../../app/routeConfig';

interface AgreementCreationActionsProps {
  onSaveDraft: () => void;
  onContinue: () => void;
}

export function AgreementCreationActions({
  onSaveDraft,
  onContinue,
}: AgreementCreationActionsProps) {
  const navigate = useNavigate();

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'center' }}
      spacing={1.5}
    >
      <Button
        variant="outlined"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate(APP_ROUTES.HOME)}
      >
        Indietro
      </Button>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        <Button
          variant="text"
          startIcon={<SaveAltRoundedIcon />}
          onClick={onSaveDraft}
        >
          Salva bozza
        </Button>
        <Button variant="contained" onClick={onContinue}>
          Continua
        </Button>
      </Stack>
    </Stack>
  );
}

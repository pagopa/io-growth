import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Button, Stack } from '@mui/material';

interface WizardFooterProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export function WizardFooter({
  currentStep,
  totalSteps,
  onBack,
  onNext,
}: WizardFooterProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <Stack direction="row" justifyContent="space-between" sx={{ mt: 4, mb: 2 }}>
      <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
        Indietro
      </Button>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" startIcon={<SaveOutlinedIcon />}>
          Salva bozza
        </Button>
        <Button variant="contained" onClick={onNext}>
          {isLastStep ? 'Invia in revisione' : 'Continua'}
        </Button>
      </Stack>
    </Stack>
  );
}

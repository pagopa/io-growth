import { useRef, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Stepper, PageHeader } from '../../components';
import { ApplicantDataStep } from './steps/ApplicantDataStep';
import { AddressStep } from './steps/AddressStep';
import { PhotoUploadStep } from './steps/PhotoUploadStep';
import { Step4Placeholder } from './steps/Step4Placeholder';
import type { StepRef } from './types';

const TOTAL_STEPS = 6;

const steps = [
  {
    title: 'Conferma i tuoi dati',
    content: ApplicantDataStep,
    confirmLabel: 'Conferma',
    cancelLabel: 'Annulla',
  },
  {
    title: 'Indica il tuo indirizzo',
    content: AddressStep,
    confirmLabel: 'Conferma',
    cancelLabel: undefined,
  },
  {
    title: 'Aggiungi una foto',
    content: PhotoUploadStep,
    confirmLabel: 'Continua',
    cancelLabel: 'Riprendi più tardi',
  },
  {
    title: 'Step 4',
    content: Step4Placeholder,
    confirmLabel: 'Continua',
    cancelLabel: undefined,
  },
];

export default function CardRequestFlowPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const stepRef = useRef<StepRef>(null);

  const {
    title,
    content: StepContent,
    confirmLabel,
    cancelLabel,
  } = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (stepRef.current) {
      const isValid = await stepRef.current.validate();
      if (!isValid) return;
    }
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: theme.palette.common.neutralGray,
      }}
    >
      <PageHeader
        title="Richiesta Carta Europea della Disabilità"
        subtitle={
          <Typography
            sx={{
              color: theme.palette.common.neutralDarkGray,
              fontSize: 17,
              lineHeight: 1.45,
              mt: 2,
            }}
          >
            Completa i passaggi e invia la richiesta.
          </Typography>
        }
        onBack={handleBack}
      />

      <Box sx={{ px: 3, pb: 3 }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            mt: 0.5,
            color: theme.palette.common.neutralBlack,
          }}
        >
          {title}
        </Typography>

        <Stepper activeStep={currentStep} totalSteps={TOTAL_STEPS} />

        <Box
          sx={{
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            p: 3,
            pb: 4,
          }}
        >
          <StepContent ref={stepRef} />
        </Box>

        <Box sx={{ pb: 'calc(140px + env(safe-area-inset-bottom, 0px))' }} />
      </Box>

      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          bgcolor: theme.palette.common.neutralGray,
          borderTop: `1px solid ${theme.palette.divider}`,
          maxWidth: '100%',
          px: 3,
          pt: 2,
          pb: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={handleNext}
          sx={{
            height: 52,
            borderRadius: '10px',
            bgcolor: theme.palette.common.primaryButton,
          }}
        >
          {confirmLabel}
        </Button>

        {cancelLabel && (
          <Button
            fullWidth
            variant="text"
            onClick={handleBack}
            sx={{
              mt: 1,
              color: theme.palette.common.primaryButton,
            }}
          >
            {cancelLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}

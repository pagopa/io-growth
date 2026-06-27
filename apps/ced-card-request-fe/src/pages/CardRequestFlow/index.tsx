import { Box, Button, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { PageHeader, Stepper } from '../../components';
import { SpinnerLoader } from '../../components/Loader';
import { Body, VSpacer } from '@pagopa/io-core-ui';
import { SavedDraftDialog } from './SavedDraftDialog';
import { AddressStep } from './steps/AddressStep';
import { ApplicantDataStep } from './steps/ApplicantDataStep';
import { DocumentTypeStep, YesNo } from './steps/DocumentTypeStep';
import { PhotoUploadStep } from './steps/PhotoUploadStep';
import SummaryStep from './steps/SummaryStep';
import type { StepRef } from './types';

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
    title: 'Indica il tipo di documento',
    content: DocumentTypeStep,
    confirmLabel: 'Continua',
    cancelLabel: 'Riprendi più tardi',
  },
  { title: 'Conferma e invia', content: SummaryStep },
];

const TOTAL_STEPS = steps.length;

export default function CardRequestFlowPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);
  const stepRef = useRef<StepRef | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docHasDoc, setDocHasDoc] = useState<YesNo>(null);

  const isContinueDisabled = currentStep === 3 && docHasDoc === 'no';

  const {
    title,
    content: StepContent,
    confirmLabel,
    cancelLabel,
  } = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const actionLabel = isLastStep
    ? 'Invia richiesta'
    : (confirmLabel ?? 'Conferma');

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }, [currentStep]);

  if (draftSaved) {
    return (
      <SavedDraftDialog
        onClose={() => navigate(APP_ROUTES.HOME)}
        onResume={() => setDraftSaved(false)}
      />
    );
  }

  const handleNext = async () => {
    if (stepRef.current) {
      const isValid = await stepRef.current.validate();
      if (!isValid) return;
    }
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSubmit = () => {
    // show loading overlay and simulate submit
    setIsSubmitting(true);
    setTimeout(() => {
      // after simulated submit, navigate to success route
      setIsSubmitting(false);
      navigate(APP_ROUTES.REQUEST_SUCCESS);
    }, 2000);
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
        subtitle={<Body>Completa i passaggi e invia la richiesta.</Body>}
        onBack={handleBack}
      />

      <VSpacer size={8} />
      <Box sx={{ px: 3 }}>
        <Body fontWeight="Semibold">{title}</Body>
        <Stepper activeStep={currentStep} totalSteps={TOTAL_STEPS} />
        <StepContent
          ref={stepRef}
          onEditApplicant={() => setCurrentStep(0)}
          onEditAddress={() => setCurrentStep(1)}
          onEditPhoto={() => setCurrentStep(2)}
          onEditJudgment={() => setCurrentStep(3)}
          onPhotoPreviewChange={(url: string) => setPhotoPreview(url)}
          photoPreview={photoPreview}
          onDocChange={(value: YesNo) => setDocHasDoc(value)}
        />
        {isSubmitting && (
          <SpinnerLoader
            fullscreen
            title="Stiamo elaborando la tua richiesta"
            description="Attendi qualche secondo"
          />
        )}
      </Box>

      <Box
        sx={{
          px: 3,
          mt: 3,
          pb: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={isContinueDisabled}
          sx={{
            height: 52,
            borderRadius: '10px',
            bgcolor: theme.palette.common.primaryButton,
          }}
        >
          {actionLabel}
        </Button>

        {cancelLabel && (
          <Button
            fullWidth
            variant="text"
            onClick={
              cancelLabel === 'Riprendi più tardi'
                ? () => setDraftSaved(true)
                : handleBack
            }
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

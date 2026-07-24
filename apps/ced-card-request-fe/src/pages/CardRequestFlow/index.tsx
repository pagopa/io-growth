import { Box, Button, useTheme } from '@mui/material';
import { Body, MobileSpinnerLoader, VSpacer } from '@pagopa/io-core-ui';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { PageHeader, Stepper } from '../../components';
import { SavedDraftDialog } from './SavedDraftDialog';
import { AddressStep } from './steps/AddressStep';
import { ApplicantDataStep } from './steps/ApplicantDataStep';
import { DocumentTypeStep } from './steps/DocumentTypeStep';
import { PhotoUploadStep } from './steps/PhotoUploadStep';
import SummaryStep from './steps/SummaryStep';
import type { StepRef } from './types';
import { useSaveDataByStep } from './hooks/useSaveDataByStep';
import GenericError from '../GenericError';

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
  const location = useLocation();
  const state = location.state as { step: number };
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(state?.step ?? 0);
  const [draftSaved, setDraftSaved] = useState(false);
  const stepRef = useRef<StepRef | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goNextStep = () => setCurrentStep((s) => s + 1);

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

  const {
    saveFirstDraftData,
    savePhoto,
    confirmRequest,
    isConfirmSuccess,
    isDraftError,
    isPhotoError,
    isLoading,
    resetDraft,
    resetPhoto,
  } = useSaveDataByStep(goNextStep);

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }, [currentStep]);

  useEffect(() => {
    if (isConfirmSuccess && isSubmitting) {
      setIsSubmitting(false);
      navigate(APP_ROUTES.REQUEST_SUCCESS);
    }
  }, [isConfirmSuccess, isSubmitting, navigate]);

  if (isLoading) {
    return <MobileSpinnerLoader title="Attendi qualche secondo" fullscreen />;
  }

  // TODO debug only
  if (isDraftError) {
    return <GenericError onRetry={saveFirstDraftData} onBack={resetDraft} />;
  }
  // TODO debug only
  if (isPhotoError) {
    return <GenericError onRetry={savePhoto} onBack={resetPhoto} />;
  }

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
      if (currentStep === 1) {
        saveFirstDraftData();
        return;
      }
      if (currentStep === 2) {
        savePhoto();
        return;
      }
    }
    if (!isLastStep) {
      goNextStep();
    }
  };

  const handleSubmit = async () => {
    // show loading overlay and simulate submit
    setIsSubmitting(true);
    try {
      await confirmRequest();
    } catch (error) {
      setIsSubmitting(false);
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
        />
        {isSubmitting && (
          <MobileSpinnerLoader
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
          disabled={isSubmitting}
          onClick={isLastStep ? handleSubmit : handleNext}
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
            disabled={isSubmitting}
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

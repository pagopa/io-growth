import { Box, Button, useTheme } from '@mui/material';
import { Body, MobileSpinnerLoader, VSpacer } from '@pagopa/io-core-ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { PageHeader, Stepper } from '../../components';
import { SavedDraftDialog } from './SavedDraftDialog';
import { AddressStep } from './steps/AddressStep';
import { ApplicantDataStep } from './steps/ApplicantDataStep';
import { DocumentTypeStep } from './steps/DocumentTypeStep/DocumentTypeStep';
import { PhotoUploadStep } from './steps/PhotoUploadStep';
import SummaryStep from './steps/SummaryStep';
import type { StepRef } from './types';
import { useSaveDataByStep } from './hooks/useSaveDataByStep';
import {
  DOCUMENT_UPLOAD_STEP_INDEX,
  getNextStepAfterDocumentType,
  getPreviousStepBeforeSummary,
} from './utils/documentTypeFlow';
import GenericError from '../GenericError';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectConfirmationForm } from '../../features/confirmation/reducer';
import UploadDocumentsStep from './steps/UploadDocumentsStep';
import {
  resetPhoto as clearPhoto,
  selectPhotoPreview,
} from '../../features/photo-upload/reducer';
import { trackCardRequestEvent } from '../../mixpanel/trackEvent';
import {
  resetForm as resetRequestForm,
  setForm,
} from '../../features/request-form/reducer';
import { selectStatusUser } from '../../features/status/selectors';
import { resetForm as resetConfirmationForm } from '../../features/confirmation/reducer';
import { isNetworkError } from '../../utils/apiError';
import { DraftChoice } from './DraftChoice';
import { visuallyHidden } from '../../utils/visuallyHidden.js';

const LOADING_MESSAGE = 'Attendi qualche secondo';

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
  {
    title: 'Carica il documento',
    content: UploadDocumentsStep,
    confirmLabel: 'Continua',
    cancelLabel: 'Riprendi più tardi',
  },
  { title: 'Conferma e invia', content: SummaryStep },
];

const TOTAL_STEPS = steps.length - 1;

const getDisplayedStep = (step: number) =>
  step >= DOCUMENT_UPLOAD_STEP_INDEX ? step - 1 : step;

const STEP_EVENT_NAMES = [
  'CED_CARD_REQUEST_APPLICANT_DATA',
  'CED_CARD_REQUEST_ADDRESS',
  'CED_CARD_REQUEST_PHOTO',
  'CED_CARD_REQUEST_DOCUMENT_TYPE',
  'CED_CARD_REQUEST_DOCUMENT_UPLOAD',
  'CED_CARD_REQUEST_SUMMARY',
];

const stepProperties = (step: number) => ({
  step: getDisplayedStep(step) + 1,
  total_steps: TOTAL_STEPS,
});

export default function CardRequestFlowPage() {
  const location = useLocation();
  const state = location.state as {
    step?: number;
    chooseDraft?: boolean;
  } | null;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(state?.step ?? 0);
  const [draftSaved, setDraftSaved] = useState(false);
  const [chooseDraft, setChooseDraft] = useState(state?.chooseDraft ?? false);
  const [failedValidationAttempts, setFailedValidationAttempts] = useState(0);
  const stepRef = useRef<StepRef | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const stepFieldsRef = useRef<HTMLDivElement>(null);
  const recoveredPhotoPreview = useAppSelector(selectPhotoPreview);
  const [photoPreview, setPhotoPreview] = useState<string>(
    recoveredPhotoPreview ?? '',
  );
  const confirmationForm = useAppSelector(selectConfirmationForm);
  const user = useAppSelector(selectStatusUser);

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
    isDraftError,
    isPhotoError,
    isConfirmError,
    draftErrorCode,
    photoErrorCode,
    confirmErrorCode,
    draftError,
    photoError,
    confirmError,
    isLoading,
    resetDraft,
    resetPhoto,
    resetConfirm,
  } = useSaveDataByStep(goNextStep);

  const visibleStep =
    isLoading ||
    isDraftError ||
    isPhotoError ||
    isConfirmError ||
    chooseDraft ||
    draftSaved
      ? null
      : currentStep;

  const withStatus = (content: ReactNode) => (
    <>
      <Box
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={visuallyHidden}
      >
        {isLoading ? LOADING_MESSAGE : null}
      </Box>
      {content}
    </>
  );

  const handleBack = () => {
    trackCardRequestEvent('CED_CARD_REQUEST_BACK', {
      event_type: 'tap',
      ...stepProperties(currentStep),
    });
    if (isLastStep) {
      setCurrentStep(getPreviousStepBeforeSummary(confirmationForm));
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      return;
    }

    navigate(-1);
  };

  useEffect(() => {
    trackCardRequestEvent(STEP_EVENT_NAMES[currentStep], {
      event_type: 'screen_view',
      ...stepProperties(currentStep),
    });
  }, [currentStep]);

  useEffect(() => {
    setFailedValidationAttempts(0);
    if (visibleStep !== null) {
      stepHeadingRef.current?.focus();
    }
  }, [visibleStep]);

  useEffect(() => {
    if (!failedValidationAttempts) return;

    const invalidField = stepFieldsRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]:not([aria-hidden="true"]):not(:disabled):not([aria-disabled="true"])',
    );
    const focusTarget =
      invalidField?.getAttribute('role') === 'radiogroup'
        ? invalidField.querySelector<HTMLInputElement>(
            'input[type="radio"]:not(:disabled)',
          )
        : invalidField;
    if (focusTarget === document.activeElement) {
      // Re-trigger focus when assistive technology leaves DOM focus on this control.
      focusTarget?.blur();
    }
    focusTarget?.focus();
  }, [failedValidationAttempts]);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }, [currentStep]);

  if (!user) {
    return <Navigate to={APP_ROUTES.LOADING} replace />;
  }

  if (isLoading) {
    return withStatus(
      <MobileSpinnerLoader title={LOADING_MESSAGE} fullscreen />,
    );
  }

  if (isDraftError) {
    return withStatus(
      <GenericError
        errorCode={draftErrorCode}
        title="Non è stato possibile salvare i dati"
        description="Se il problema persiste, riprova in un secondo momento."
        network={isNetworkError(draftError)}
        multiTitle="Ci sono alcuni errori nei tuoi dati anagrafici"
        moreInfoLabel="Scopri di più"
        onRetry={saveFirstDraftData}
        onClose={resetDraft}
      />,
    );
  }
  if (isPhotoError) {
    const isPhotoValidationError =
      photoErrorCode?.length &&
      photoErrorCode.every((code) => code >= 904 && code <= 911);
    return withStatus(
      <GenericError
        errorCode={photoErrorCode}
        title="Non è stato possibile salvare la foto"
        description="Se il problema persiste, riprova in un secondo momento."
        network={isNetworkError(photoError)}
        multiTitle="La foto non è idonea"
        closeLabel={isPhotoValidationError ? 'Cambia foto' : undefined}
        moreInfoLabel="Scopri di più"
        onRetry={savePhoto}
        onClose={() => {
          if (isPhotoValidationError) {
            dispatch(clearPhoto());
            setPhotoPreview('');
          }
          resetPhoto();
        }}
      />,
    );
  }
  if (isConfirmError) {
    return withStatus(
      <GenericError
        errorCode={confirmErrorCode}
        title="Non è stato possibile salvare i dati"
        description="Se il problema persiste, riprova in un secondo momento."
        network={isNetworkError(confirmError)}
        onRetry={confirmRequest}
        onClose={resetConfirm}
      />,
    );
  }

  if (chooseDraft) {
    return withStatus(
      <DraftChoice
        onResume={() => setChooseDraft(false)}
        onNew={() => {
          dispatch(resetRequestForm());
          dispatch(setForm({ nome: user.givenName, cognome: user.familyName }));
          dispatch(resetConfirmationForm());
          dispatch(clearPhoto());
          setPhotoPreview('');
          setCurrentStep(0);
          setChooseDraft(false);
        }}
      />,
    );
  }

  if (draftSaved) {
    return withStatus(
      <SavedDraftDialog
        onClose={() => navigate(APP_ROUTES.HOME)}
        onResume={() => setDraftSaved(false)}
      />,
    );
  }

  const handleNext = async () => {
    if (stepRef.current) {
      const isValid = await stepRef.current.validate();
      if (!isValid) {
        setFailedValidationAttempts((attempts) => attempts + 1);
        return;
      }
      setFailedValidationAttempts(0);
      trackCardRequestEvent('CED_CARD_REQUEST_STEP_COMPLETED', {
        event_type: 'tap',
        ...stepProperties(currentStep),
      });
      if (currentStep === 1) {
        saveFirstDraftData();
        return;
      }
      if (currentStep === 2) {
        savePhoto();
        return;
      }
      if (currentStep === 3) {
        const nextStep = getNextStepAfterDocumentType(confirmationForm);
        setCurrentStep(nextStep);
        return;
      }
    }
    if (!isLastStep) {
      goNextStep();
    }
  };

  const handleSubmit = async () => {
    trackCardRequestEvent('CED_CARD_REQUEST_SUBMIT', {
      event_type: 'tap',
      ...stepProperties(currentStep),
    });
    await confirmRequest();
  };

  return withStatus(
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

      <VSpacer size={16} />
      <Box sx={{ px: 3 }}>
        <Box
          key={currentStep}
          component="h2"
          ref={stepHeadingRef}
          tabIndex={-1}
          sx={{
            m: 0,
            fontSize: '18px',
            lineHeight: '24px',
            fontWeight: 600,
            color: theme.palette.common.neutralBlack,
          }}
        >
          {title}
        </Box>
        <Stepper
          activeStep={getDisplayedStep(currentStep)}
          totalSteps={TOTAL_STEPS}
        />
        <Box ref={stepFieldsRef}>
          <StepContent
            ref={stepRef}
            onEditApplicant={() => setCurrentStep(0)}
            onEditAddress={() => setCurrentStep(1)}
            onEditPhoto={() => setCurrentStep(2)}
            onEditJudgment={() => setCurrentStep(4)}
            onPhotoPreviewChange={(url: string) => setPhotoPreview(url)}
            photoPreview={photoPreview}
          />
        </Box>
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
          disabled={isLoading}
          onClick={isLastStep ? handleSubmit : handleNext}
          sx={{
            height: 52,
            fontSize: 18,
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
            disabled={isLoading}
            onClick={
              cancelLabel === 'Riprendi più tardi'
                ? () => {
                    trackCardRequestEvent('CED_CARD_REQUEST_RESUME_LATER', {
                      event_type: 'tap',
                      ...stepProperties(currentStep),
                    });
                    setDraftSaved(true);
                  }
                : handleBack
            }
            sx={{
              mt: 1,
              fontSize: 18,
              color: theme.palette.common.primaryButton,
            }}
          >
            {cancelLabel}
          </Button>
        )}
      </Box>
    </Box>,
  );
}

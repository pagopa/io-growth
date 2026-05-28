import { useState, type ComponentType } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { useSaveBenefitDraftMutation } from '../../features/benefits/api';
import {
  selectAccessPoint,
  selectNationwide,
  selectSelectedLocationIds,
  selectSelectedWebsiteIds,
} from '../../features/wizard/slice';
import { useAppSelector } from '../../hooks/store';
import { AppModal } from '../../components';
import { WizardFooter } from './components/WizardFooter';
import { WizardStepper } from './components/WizardStepper';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { useToast } from '../../contexts';
import { useGetFirstStepValidation } from './hooks/useGetFirstStepValidation';
export interface StepProps {
  attempted: boolean;
}

interface StepConfig {
  label: string;
  component: ComponentType<StepProps>;
}

const STEPS: StepConfig[] = [
  { label: 'Dettagli opportunità', component: StepOne },
  { label: 'Indica i punti di accesso', component: StepTwo },
];

export default function CreateBenefitPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [submitReviewOpen, setSubmitReviewOpen] = useState(false);
  const { showToast } = useToast();

  const [saveDraft, { isLoading: isSavingDraft }] =
    useSaveBenefitDraftMutation();

  // Leaving here commented, needed for test purposes only in local env
  // will be removed after https://github.com/pagopa/io-growth/pull/117 is merged
  // await create();
  // const create = useCreateOpportunity();

  const accessPoint = useAppSelector(selectAccessPoint);
  const nationwide = useAppSelector(selectNationwide);
  const selectedLocationIds = useAppSelector(selectSelectedLocationIds);
  const selectedWebsiteIds = useAppSelector(selectSelectedWebsiteIds);

  const isFirstStepValid = useGetFirstStepValidation();

  const isStepValid = (step: number): boolean => {
    if (step === 0) return isFirstStepValid;
    if (step === 1) {
      const hasTerritory =
        accessPoint === 'territory' || accessPoint === 'both';
      const hasOnline = accessPoint === 'online' || accessPoint === 'both';
      return (
        !!accessPoint &&
        (!hasTerritory || nationwide || selectedLocationIds.length > 0) &&
        (!hasOnline || selectedWebsiteIds.length > 0)
      );
    }
    return true;
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft({
        localizedForm: {},
        accessPoint,
        nationwide,
        selectedLocationIds,
        selectedWebsiteIds,
      }).unwrap();
      showToast('Bozza salvata con successo', 'success');
      navigate(APP_ROUTES.HOME);
    } catch {
      showToast('Errore durante il salvataggio della bozza', 'error');
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate(-1);
    } else {
      setAttempted(false);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && !accessPoint) {
      showToast('Indica il punto di accesso per continuare', 'error');
      return;
    }
    setAttempted(true);
    if (!isStepValid(currentStep)) return;
    if (currentStep === STEPS.length - 1) {
      setSubmitReviewOpen(true);
    } else {
      // Leaving here commented, needed for test purposes only in local env
      // will be removed after https://github.com/pagopa/io-growth/pull/117 is merged
      // await create();
      setAttempted(false);
      setCurrentStep((s) => s + 1);
    }
  };

  const handleConfirmSubmitReview = () => {
    setSubmitReviewOpen(false);
    navigate(-1);
  };

  const CurrentStep = STEPS[currentStep]?.component ?? null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'common.neutralGray',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box component="main" sx={{ flex: 1, overflowY: 'auto', py: 3 }}>
        <Container maxWidth={false} sx={{ maxWidth: 760 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ width: 24, height: 24 }} />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 2,
              color: 'common.neutralBlack',
              textTransform: 'none',
              p: 0,
            }}
          >
            Esci
          </Button>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Crea opportunità
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Compila i campi per aggiungere un&apos;opportunità e inviala in
            revisione. Una volta approvata, sarà pubblicata su IO.
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 3, mb: 3, fontWeight: 600, color: 'error.dark' }}
          >
            * Campo obbligatorio
          </Typography>
          <WizardStepper
            steps={STEPS.map((s) => s.label)}
            currentStep={currentStep}
          />
          {CurrentStep && <CurrentStep attempted={attempted} />}
          <WizardFooter
            currentStep={currentStep}
            totalSteps={STEPS.length}
            onBack={handleBack}
            onNext={handleNext}
            onSaveDraft={handleSaveDraft}
            isSavingDraft={isSavingDraft}
          />
        </Container>
      </Box>
      <AppModal
        open={submitReviewOpen}
        onClose={() => setSubmitReviewOpen(false)}
        title="Invia in revisione"
        description="Il Dipartimento effettuerà la revisione della tua opportunità. Il processo potrebbe richiedere diverso tempo. Se approvata, sarà pubblicata su IO a partire dalla data di inizio validità che hai scelto."
      >
        <Button
          variant="contained"
          fullWidth
          onClick={handleConfirmSubmitReview}
        >
          Invia in revisione
        </Button>
      </AppModal>
    </Box>
  );
}

import { useState, type ComponentType } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Container, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { useRequestApprovalMutation } from '../../features/opportunities/api';
import { resetPlaces } from '../../features/places/placesSlice';
import {
  selectAccessPoint,
  selectSelectedLocationIds,
  selectSelectedWebsiteIds,
} from '../../features/places/selectors';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { AppModal } from '../../components';
import { WizardFooter } from './components/WizardFooter';
import { WizardStepper } from './components/WizardStepper';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { useToast } from '../../contexts';
import { useGetFirstStepValidation } from './hooks/useGetFirstStepValidation';
import { useCreateOpportunity } from './hooks/useCreateOpportunity';
import type { CreateBenefitNavigationState } from './types';
import { useHydrateFromSourceOpportunity } from './hooks/useHydrateFromSourceOpportunity';
import { selectNationalTerritory } from '../../features/opportunityCreation/selectors';

export interface StepProps {
  attempted: boolean;
}

interface StepConfig {
  label: string;
  component: ComponentType<StepProps>;
}

const STEPS: StepConfig[] = [
  { label: 'Inserisci i dettagli', component: StepOne },
  { label: 'Indica i punti di accesso', component: StepTwo },
];

export default function CreateBenefitPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation() as {
    state: CreateBenefitNavigationState | null;
  };

  const sourceOpportunityId = location.state?.sourceOpportunityId ?? null;
  useHydrateFromSourceOpportunity(sourceOpportunityId);

  const [currentStep, setCurrentStep] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [submitReviewOpen, setSubmitReviewOpen] = useState(false);
  const { showToast } = useToast();
  const [createOpportunity, { isLoading: isCreatingOpportunity }] =
    useCreateOpportunity();

  const [requestApproval, { isLoading: isRequestingApproval }] =
    useRequestApprovalMutation();

  const accessPoint = useAppSelector(selectAccessPoint);
  const nationwide = useAppSelector(selectNationalTerritory);
  const selectedLocationIds = useAppSelector(selectSelectedLocationIds);
  const selectedWebsiteIds = useAppSelector(selectSelectedWebsiteIds);

  const isFirstStepValid = useGetFirstStepValidation();

  const isStepValid = (step: number): boolean => {
    if (step === 0) return isFirstStepValid;
    if (step === 1) {
      const hasTerritory = accessPoint === 'offline' || accessPoint === 'both';
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
    await createOpportunity({ isDraft: true });
    dispatch(resetPlaces());
    navigate(APP_ROUTES.HOME);
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
      setAttempted(false);
      setCurrentStep((s) => s + 1);
    }
  };

  const handleRequestApproval = async (opportunityId: string) => {
    try {
      await requestApproval(opportunityId).unwrap();
      dispatch(resetPlaces());
      showToast('Richiesta di approvazione inviata con successo', 'success');
      navigate(APP_ROUTES.HOME);
    } catch {
      showToast(
        "Errore durante l'invio della richiesta di approvazione",
        'error',
      );
    }
  };

  const handleConfirmSubmitReview = async () => {
    setSubmitReviewOpen(false);

    if (!sourceOpportunityId) {
      try {
        const result = await createOpportunity();
        if (!result?.id) {
          showToast(
            "Impossibile inviare in revisione senza un'opportunità esistente",
            'error',
          );
          return;
        }
        handleRequestApproval(result.id);
      } catch {
        return;
      }
      return;
    }

    handleRequestApproval(sourceOpportunityId);
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
            sx={{
              mt: 3,
              mb: 3,
              fontWeight: 600,
            }}
            color="common.requiredField"
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
            isSavingDraft={isCreatingOpportunity}
          />
        </Container>
      </Box>
      <AppModal
        open={submitReviewOpen}
        onClose={() => setSubmitReviewOpen(false)}
        title="Invia in revisione"
        description="Il Dipartimento effettuerà la revisione della tua opportunità. Il processo potrebbe richiedere un po' di tempo. Se approvata, sarà pubblicata su IO a partire dalla data di inizio validità che hai scelto."
      >
        <Button
          variant="contained"
          fullWidth
          onClick={handleConfirmSubmitReview}
          disabled={isCreatingOpportunity || isRequestingApproval}
        >
          Invia in revisione
        </Button>
      </AppModal>
    </Box>
  );
}

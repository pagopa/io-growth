import type React from 'react';
import { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Footer, PageHeader, TopUtilityBar } from '../../components';
import {
  selectAccessPoint,
  selectNationwide,
  selectSelectedLocationIds,
  selectSelectedWebsiteIds,
} from '../../features/wizard/slice';
import { useAppSelector } from '../../hooks/store';
import { WizardFooter } from './components/WizardFooter';
import { WizardStepper } from './components/WizardStepper';
import { StepTwo } from './StepTwo';

export interface StepProps {
  attempted: boolean;
}

interface StepConfig {
  label: string;
  component: React.ComponentType<StepProps>;
}

const STEPS: StepConfig[] = [
  { label: 'Indica i punti di accesso', component: StepTwo }, // TODO: implementare step 2
];

export default function WizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [attempted, setAttempted] = useState(false);

  const accessPoint = useAppSelector(selectAccessPoint);
  const nationwide = useAppSelector(selectNationwide);
  const selectedLocationIds = useAppSelector(selectSelectedLocationIds);
  const selectedWebsiteIds = useAppSelector(selectSelectedWebsiteIds);

  const isStepValid = (step: number): boolean => {
    if (step !== 0) return true;
    const hasTerritory = accessPoint === 'territory' || accessPoint === 'both';
    const hasOnline = accessPoint === 'online' || accessPoint === 'both';
    return (
      !!accessPoint &&
      (!hasTerritory || nationwide || selectedLocationIds.length > 0) &&
      (!hasOnline || selectedWebsiteIds.length > 0)
    );
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate(-1);
    } else {
      setAttempted(false);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleNext = () => {
    setAttempted(true);
    if (!isStepValid(currentStep)) return;
    if (currentStep === STEPS.length - 1) {
      navigate(-1);
    } else {
      setAttempted(false);
      setCurrentStep((s) => s + 1);
    }
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
      <TopUtilityBar />
      <PageHeader />
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
            Crea agevolazione
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Compila i campi per aggiungere un&apos;agevolazione e inviala in
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
          />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

import { Step, StepLabel, Stepper } from '@mui/material';

const STEPS = ['Inserisci i dettagli', 'Indica i punti di accesso'];

interface AgreementCreationStepperProps {
  activeStep: number;
}

export function AgreementCreationStepper({
  activeStep,
}: AgreementCreationStepperProps) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {STEPS.map((step) => (
        <Step key={step}>
          <StepLabel>{step}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

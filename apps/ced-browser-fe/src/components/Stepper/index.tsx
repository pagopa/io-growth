import { Step, StepLabel, Stepper as MuiStepper } from '@mui/material';

type Props = {
  activeStep: number;
  totalSteps: number;
};

export const Stepper = ({ activeStep, totalSteps }: Props) => (
  <MuiStepper
    alternativeLabel
    activeStep={activeStep}
    sx={{
      mt: 2,
      mb: 2,
    }}
  >
    {Array.from({ length: totalSteps }).map((_, index) => (
      <Step key={`step-${index + 1}`}>
        <StepLabel> </StepLabel>
      </Step>
    ))}
  </MuiStepper>
);

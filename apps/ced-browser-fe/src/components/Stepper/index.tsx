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
      width: '100%',
      '& .MuiStep-root': {
        p: 0,
        flex: 1,
      },
      '& .MuiStepLabel-root': {
        width: '100%',
      },
      '& .MuiStepConnector-root': {
        top: 10,
        left: 'calc(-50% + 14px)',
        right: 'calc(50% + 14px)',
      },
      '& .MuiStepConnector-line': {
        borderTopWidth: 4,
      },
    }}
  >
    {Array.from({ length: totalSteps }).map((_, index) => (
      <Step key={`step-${index + 1}`}>
        <StepLabel> </StepLabel>
      </Step>
    ))}
  </MuiStepper>
);

import Step from '@mui/material/Step';
import StepConnector, {
  stepConnectorClasses,
} from '@mui/material/StepConnector';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';

interface WizardStepperProps {
  steps: string[];
  currentStep: number;
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <Stepper
      activeStep={currentStep}
      connector={
        <StepConnector
          sx={{
            flex: 1,
            alignSelf: 'flex-start',
            mt: '8px',
            [`& .${stepConnectorClasses.line}`]: {
              borderTopWidth: 4,
              borderRadius: 2,
              borderColor: '#D2D6E3',
            },
            [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line},
              &.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]:
              {
                borderColor: 'common.primaryButton',
              },
          }}
        />
      }
      sx={{
        p: 0,
        mb: 4,
        width: '100%',
        alignItems: 'flex-start',
        '& .MuiStep-root': { p: 0, flex: 'none' },
        '& .MuiStepLabel-root': {
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        },
        '& .MuiStepLabel-iconContainer': { p: 0 },
        '& .MuiStepLabel-labelContainer': { mt: 0.5, width: 'auto' },
        '& .MuiStepLabel-label': { color: '#0E0F13', fontWeight: 600 },
        '& .MuiStepIcon-root': {
          width: 20,
          height: 20,
          color: '#D2D6E3',
          '&.Mui-active, &.Mui-completed': { color: 'common.primaryButton' },
        },
        '& .MuiStepIcon-text': {
          fontSize: '12px',
          fontWeight: 700,
          fill: '#636B82',
        },
        '& .Mui-active .MuiStepIcon-text, & .Mui-completed .MuiStepIcon-text': {
          fill: '#ffffff',
        },
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

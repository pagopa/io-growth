import { Stack } from '@mui/system';
import { PropsWithChildren } from 'react';
import { AgreementCreationHeader } from './components/AgreementCreationHeader';
import { AgreementCreationStepper } from './components/AgreementCreationStepper';
import { AgreementCreationActions } from './components/AgreementCreationActions';

export const AgreementDetailLayout = ({ children }: PropsWithChildren) => {
  return (
    <Stack sx={{ maxWidth: 820, mx: 'auto' }} spacing={2}>
      <AgreementCreationHeader />
      <AgreementCreationStepper activeStep={0} />
      {children}
      <AgreementCreationActions
        onContinue={() => null}
        onSaveDraft={() => null}
      />
    </Stack>
  );
};

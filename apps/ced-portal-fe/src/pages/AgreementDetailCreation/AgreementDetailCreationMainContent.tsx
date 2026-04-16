import { Box, Stack, useTheme } from '@mui/material';
import { AgreementCreationActions } from './components/AgreementCreationActions';
import { AgreementCreationHeader } from './components/AgreementCreationHeader';
import { AgreementCreationStepper } from './components/AgreementCreationStepper';
import { AgreementLinkSection } from './components/AgreementLinkSection';
import { AgreementValiditySection } from './components/AgreementValiditySection';
import { AgreementDetailsSection } from './components/AgreementDetailsSection';
import { AgreementCompanionSection } from './components/AgreementCompanionSection';

export const AgreementDetailCreationMainContent = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{ flex: 1, px: { xs: 2, md: 3.5 }, py: { xs: 3, md: 4.5 } }}
      bgcolor={theme.palette.common.neutralGray}
    >
      <Stack sx={{ maxWidth: 820, mx: 'auto' }} spacing={2}>
        <AgreementCreationHeader />
        <AgreementCreationStepper activeStep={0} />
        <AgreementDetailsSection />
        <AgreementCompanionSection />
        <AgreementValiditySection />
        <AgreementLinkSection />
        <AgreementCreationActions
          onSaveDraft={() => undefined}
          onContinue={() => undefined}
        />
      </Stack>
    </Box>
  );
};

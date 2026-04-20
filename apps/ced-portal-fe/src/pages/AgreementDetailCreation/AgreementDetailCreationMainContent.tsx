import { Box, useTheme } from '@mui/material';
import { AgreementLinkSection } from './components/AgreementLinkSection';
import { AgreementValiditySection } from './components/AgreementDateValiditySection';
import { AgreementDetailsSection } from './components/AgreementDetailsSection';
import { AgreementCompanionSection } from './components/AgreementCompanionSection';
import { AgreementDetailLayout } from './components/AgreementDetailLayout';

export const AgreementDetailCreationMainContent = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{ flex: 1, px: { xs: 2, md: 3.5 }, py: { xs: 3, md: 4.5 } }}
      bgcolor={theme.palette.common.neutralGray}
    >
      <AgreementDetailLayout>
        <AgreementDetailsSection />
        <AgreementCompanionSection />
        <AgreementValiditySection />
        <AgreementLinkSection />
      </AgreementDetailLayout>
    </Box>
  );
};

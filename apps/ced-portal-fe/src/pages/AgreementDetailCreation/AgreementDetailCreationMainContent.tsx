import { Box, useTheme } from '@mui/material';
import { AgreementLinkSection } from '../CreateBenefit/StepOne/AgreementLinkSection';
import { AgreementValiditySection } from '../CreateBenefit/StepOne/AgreementValiditySection';
import { AgreementDetailsSection } from '../CreateBenefit/StepOne/AgreementDetailsSection';
import { AgreementCompanionSection } from '../CreateBenefit/StepOne/AgreementCompanionSection';
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

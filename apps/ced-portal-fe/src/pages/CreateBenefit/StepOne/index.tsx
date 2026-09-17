import { Box } from '@mui/material';
import type { StepProps } from '../index';
import { AgreementDetailsSection } from './AgreementDetailsSection';
import { AgreementCompanionSection } from './AgreementCompanionSection';
import { AgreementValiditySection } from './AgreementValiditySection';
import { AgreementLinkSection } from './AgreementLinkSection';

export function StepOne({ attempted, isStartDateDisabled }: StepProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <AgreementDetailsSection attempted={attempted} />
      <AgreementCompanionSection />
      <AgreementValiditySection
        attempted={attempted}
        isStartDateDisabled={isStartDateDisabled}
      />
      <AgreementLinkSection attempted={attempted} />
    </Box>
  );
}

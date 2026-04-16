import { Box } from '@mui/material';
import { useAppSelector } from '../../../hooks/store';
import {
  selectAccessPoint,
  selectNationwide,
  selectSelectedSedeIds,
} from '../../../features/wizard/slice';
import type { StepProps } from '../index';
import { WizardAlert } from '../components/WizardAlert';
import { AccessPointSection } from './AccessPointSection';
import { LocationManagementSection } from './LocationManagementSection';

export function StepTwo({ attempted }: StepProps) {
  const accessPoint = useAppSelector(selectAccessPoint);
  const nationwide = useAppSelector(selectNationwide);
  const selectedSedeIds = useAppSelector(selectSelectedSedeIds);

  const needsLocation =
    attempted &&
    (accessPoint === 'territory' || accessPoint === 'both') &&
    !nationwide &&
    selectedSedeIds.length === 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {needsLocation && (
        <WizardAlert>
          Seleziona &quot;Su tutto il territorio nazionale&quot; o indica almeno
          una sede.
        </WizardAlert>
      )}
      <AccessPointSection />
      <LocationManagementSection />
    </Box>
  );
}

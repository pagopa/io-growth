import { Box } from '@mui/material';
import { useAppSelector } from '../../../hooks/store';
import {
  selectAccessPoint,
  selectNationwide,
  selectSelectedLocationIds,
  selectSelectedWebsiteIds,
} from '../../../features/wizard/slice';
import type { StepProps } from '../index';
import { WizardAlert } from '../components/WizardAlert';
import { AccessPointSection } from './AccessPointSection';
import { LocationManagementSection } from './LocationManagementSection';
import { WebsiteManagementSection } from './WebsiteManagementSection';

export function StepTwo({ attempted }: StepProps) {
  const accessPoint = useAppSelector(selectAccessPoint);
  const nationwide = useAppSelector(selectNationwide);
  const selectedLocationIds = useAppSelector(selectSelectedLocationIds);
  const selectedWebsiteIds = useAppSelector(selectSelectedWebsiteIds);

  const needsLocation =
    attempted &&
    (accessPoint === 'territory' || accessPoint === 'both') &&
    !nationwide &&
    selectedLocationIds.length === 0;

  const needsWebsite =
    attempted &&
    (accessPoint === 'online' || accessPoint === 'both') &&
    selectedWebsiteIds.length === 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {needsLocation && (
        <WizardAlert>
          Seleziona &quot;Su tutto il territorio nazionale&quot; o indica almeno
          una sede.
        </WizardAlert>
      )}
      {needsWebsite && <WizardAlert>Indica almeno un sito web.</WizardAlert>}
      <AccessPointSection />
      <LocationManagementSection />
      <WebsiteManagementSection />
    </Box>
  );
}

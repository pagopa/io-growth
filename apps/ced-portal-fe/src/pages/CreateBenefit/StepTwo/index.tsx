import { Box } from '@mui/material';
import { useAppSelector } from '../../../hooks/store';
import {
  selectAccessPoint,
  selectSelectedLocationIds,
  selectSelectedWebsiteIds,
} from '../../../features/places/selectors';
import type { StepProps } from '../index';
import { WizardAlert } from '../components/WizardAlert';
import { AccessPointSection } from './AccessPointSection';
import { LocationManagementSection } from './LocationManagementSection';
import { WebsiteManagementSection } from './WebsiteManagementSection';
import { selectNationalTerritory } from '../../../features/opportunityCreation/selectors';

export function StepTwo({ attempted }: StepProps) {
  const accessPoint = useAppSelector(selectAccessPoint);
  const nationwide = useAppSelector(selectNationalTerritory);
  const selectedLocationIds = useAppSelector(selectSelectedLocationIds);
  const selectedWebsiteIds = useAppSelector(selectSelectedWebsiteIds);

  const needsLocation =
    attempted &&
    (accessPoint === 'offline' || accessPoint === 'both') &&
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
          Seleziona &quot;Ovunque&quot; o indica almeno una sede.
        </WizardAlert>
      )}
      {needsWebsite && <WizardAlert>Indica almeno un sito web.</WizardAlert>}
      <AccessPointSection />
      <LocationManagementSection />
      <WebsiteManagementSection />
    </Box>
  );
}

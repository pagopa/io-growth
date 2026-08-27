import { Box } from '@mui/material';
import { MIAlert } from '@pagopa/mui-italia';
import { selectNationalTerritory } from '../../../features/opportunityCreation/selectors';
import {
  selectAccessPoint,
  selectSelectedLocationIds,
  selectSelectedWebsiteIds,
} from '../../../features/places/selectors';
import { useAppSelector } from '../../../hooks/store';
import type { StepProps } from '../index';
import { AccessPointSection } from './AccessPointSection';
import { LocationManagementSection } from './LocationManagementSection';
import { WebsiteManagementSection } from './WebsiteManagementSection';

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
        <MIAlert severity="error">
          Seleziona &quot;Ovunque&quot; o indica almeno una sede.
        </MIAlert>
      )}
      {needsWebsite && (
        <MIAlert severity="error">Indica almeno un sito web.</MIAlert>
      )}
      <AccessPointSection />
      <LocationManagementSection />
      <WebsiteManagementSection />
    </Box>
  );
}

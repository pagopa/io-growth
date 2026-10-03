import AddIcon from '@mui/icons-material/Add';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, Button, Typography } from '@mui/material';
import { useMemo } from 'react';
import { SectionCard } from '../../../../components';
import { useGetPlacesQuery } from '../../../../features/places/api';
import type { PlaceListItem } from '../../../../generated/model';

import {
  selectAccessPoint,
  selectSelectedWebsiteIds,
} from '../../../../features/places/selectors';
import { useAppSelector } from '../../../../hooks/store';
import { useWebsiteSelectionFlow } from '../hooks/useWebsiteSelectionFlow';
import { AddWebsiteModal } from './AddWebsiteModal';
import { SelectWebsiteModal } from './SelectWebsiteModal';
import { WebsiteList } from './WebsiteList';

type OnlinePlaceListItem = PlaceListItem & {
  type: 'online';
  website: NonNullable<PlaceListItem['website']>;
};

export function WebsiteManagementSection() {
  const accessPoint = useAppSelector(selectAccessPoint);
  const showWebsiteSection = accessPoint === 'online' || accessPoint === 'both';

  const selectedWebsiteIds = useAppSelector(selectSelectedWebsiteIds);
  const { data: placesData } = useGetPlacesQuery(
    { type: 'online' }, // Fetch online places
    { skip: !showWebsiteSection },
  );

  const availableWebsites = useMemo(
    () =>
      (placesData?.items ?? []).filter(
        (place): place is OnlinePlaceListItem =>
          place.type === 'online' && Boolean(place.website?.url),
      ),
    [placesData],
  );

  const selectedWebsites = useMemo(
    () => availableWebsites.filter((w) => selectedWebsiteIds.includes(w.id)),
    [availableWebsites, selectedWebsiteIds],
  );

  const {
    modal,
    pendingSelection,
    setPendingSelection,
    handleAddClick,
    handleAddConfirm,
    handleSelectConfirm,
    handleSelectClose,
    handleAddNew,
    handleBack,
    handleAddClose,
    handleRemove,
  } = useWebsiteSelectionFlow();

  if (!showWebsiteSection) return null;

  return (
    <>
      <SectionCard sx={{ gap: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
          <Typography
            variant="body2"
            sx={{ color: 'common.neutralBlack' }}
            fontWeight={600}
          >
            Siti web
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAddClick(availableWebsites.length > 0)}
          sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
        >
          Aggiungi siti web
        </Button>

        <WebsiteList websites={selectedWebsites} onRemove={handleRemove} />
      </SectionCard>

      {modal === 'select' && (
        <SelectWebsiteModal
          open
          websites={availableWebsites}
          selected={pendingSelection}
          onSelectedChange={setPendingSelection}
          onClose={handleSelectClose}
          onAddNew={handleAddNew}
          onConfirm={handleSelectConfirm}
        />
      )}

      {(modal === 'add' || modal === 'add-from-select') && (
        <AddWebsiteModal
          open
          onClose={handleAddClose}
          onConfirm={handleAddConfirm}
          onBack={modal === 'add-from-select' ? handleBack : undefined}
        />
      )}
    </>
  );
}

import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { SectionCard } from '../../../../components';
import { useGetLocationsQuery } from '../../../../features/location/api';
import {
  selectAccessPoint,
  selectNationwide,
  selectSelectedLocationIds,
  setNationwide,
} from '../../../../features/wizard/slice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { useLocationSelectionFlow } from '../hooks/useLocationSelectionFlow';
import { AddLocationModal } from './AddLocationModal';
import { LocationList } from './LocationList';
import { SelectLocationModal } from './SelectLocationModal';

export function LocationManagementSection() {
  const dispatch = useAppDispatch();
  const accessPoint = useAppSelector(selectAccessPoint);
  const nationwide = useAppSelector(selectNationwide);
  const showTerritorySection = accessPoint === 'territory';

  const selectedLocationIds = useAppSelector(selectSelectedLocationIds);
  const { data: availableLocations = [] } = useGetLocationsQuery(undefined, {
    skip: !showTerritorySection,
  });
  const selectedLocations = availableLocations.filter((s) =>
    selectedLocationIds.includes(s.id),
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
  } = useLocationSelectionFlow();

  if (!showTerritorySection) return null;

  return (
    <>
      <SectionCard sx={{ gap: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
          <Typography
            variant="body2"
            sx={{ color: 'common.neutralBlack' }}
            fontWeight={600}
          >
            Sedi
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={nationwide}
              size="medium"
              onChange={(e) => dispatch(setNationwide(e.target.checked))}
            />
          }
          label={
            <Typography variant="body2" fontWeight={600}>
              Su tutto il territorio nazionale
            </Typography>
          }
          sx={{ ml: 0, gap: 1 }}
        />

        {!nationwide && (
          <>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAddClick(availableLocations.length > 0)}
              sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
            >
              Aggiungi sedi
            </Button>

            <LocationList
              locations={selectedLocations}
              onRemove={handleRemove}
            />
          </>
        )}
      </SectionCard>

      {modal === 'select' && (
        <SelectLocationModal
          open
          locations={availableLocations}
          selected={pendingSelection}
          onSelectedChange={setPendingSelection}
          onClose={handleSelectClose}
          onAddNew={handleAddNew}
          onConfirm={handleSelectConfirm}
        />
      )}

      {(modal === 'add' || modal === 'add-from-select') && (
        <AddLocationModal
          open
          onClose={handleAddClose}
          onConfirm={handleAddConfirm}
          onBack={modal === 'add-from-select' ? handleBack : undefined}
          existingLocations={availableLocations}
        />
      )}
    </>
  );
}

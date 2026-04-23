import { Box } from '@mui/material';
import { AppAutocomplete, AppTextField } from '../../../../components';
import { useLocationAddressSearch } from '../../../../features/location/hooks';
import {
  selectLocationForm,
  setLocationName,
} from '../../../../features/location/locationSlice';
import type { Location } from '../../../../features/location/types';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';

interface LocationFieldsProps {
  existingLocations: Location[];
}

export function LocationFields({ existingLocations }: LocationFieldsProps) {
  const dispatch = useAppDispatch();
  const { name, address, city, postalCode, province } =
    useAppSelector(selectLocationForm);
  const { addressOptions, handleAddressChange, handleAddressSelect } =
    useLocationAddressSearch(existingLocations);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <AppTextField
        label="Nome"
        required
        value={name}
        onChange={(e) => dispatch(setLocationName(e.target.value))}
      />

      <AppAutocomplete
        label="Indirizzo"
        required
        options={addressOptions}
        inputValue={address || ''}
        onValueChange={handleAddressChange}
        onSelect={handleAddressSelect}
      />

      {city && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <AppTextField
            label="Città"
            value={city}
            disabled
            sx={{ flex: { xs: '1 1 100%', sm: 1 } }}
          />
          <AppTextField
            label="CAP"
            value={postalCode}
            disabled
            sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: 1 } }}
          />
          <AppTextField
            label="Provincia"
            value={province}
            disabled
            sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: 1 } }}
          />
        </Box>
      )}
    </Box>
  );
}

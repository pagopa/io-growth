import { Box } from '@mui/material';
import {
  AppAutocomplete,
  AppTextField,
  FormField,
} from '../../../../components';
import { useLocationAddressSearch } from '../../../../features/location/hooks';
import {
  selectLocationForm,
  setLocationName,
} from '../../../../features/location/locationSlice';
import type { Location } from '../../../../features/location/types';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { useCheckRequiredLocationField } from './hooks/useCheckRequiredLocationField';

interface LocationFieldsProps {
  existingLocations: Location[];
  attempted?: boolean;
}

export function LocationFields({
  existingLocations,
  attempted,
}: LocationFieldsProps) {
  const dispatch = useAppDispatch();
  const { name, address, city, postalCode, province } =
    useAppSelector(selectLocationForm);
  const { addressOptions, handleAddressChange, handleAddressSelect } =
    useLocationAddressSearch(existingLocations);

  const nameField = useCheckRequiredLocationField({
    key: 'name',
    required: true,
    attempted,
  });
  const addressField = useCheckRequiredLocationField({
    key: 'address',
    required: true,
    attempted,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormField
        value={name}
        label="Nome"
        required
        onChange={(e) => dispatch(setLocationName(e.target.value))}
        {...nameField}
      >
        <AppTextField />
      </FormField>

      <FormField label="Indirizzo" required {...addressField}>
        <AppAutocomplete
          inputValue={address || ''}
          options={addressOptions}
          onValueChange={handleAddressChange}
          onSelect={handleAddressSelect}
        />
      </FormField>
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

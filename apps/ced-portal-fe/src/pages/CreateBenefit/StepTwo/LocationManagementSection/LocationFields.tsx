import { Box } from '@mui/material';
import { AppTextField, FormField } from '../../../../components';
import {
  selectLocationForm,
  setLocationAddress,
  setLocationCity,
  setLocationName,
  setLocationPostalCode,
  setLocationProvince,
} from '../../../../features/location/locationSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { useCheckRequiredLocationField } from './hooks/useCheckRequiredLocationField';

interface LocationFieldsProps {
  attempted?: boolean;
}

export function LocationFields({ attempted }: LocationFieldsProps) {
  const dispatch = useAppDispatch();
  const { name, address, city, postalCode, province } =
    useAppSelector(selectLocationForm);
  // TODO: restore when an address search API with geocoding is available
  // const { addressOptions, handleAddressChange, handleAddressSelect } =
  //   useLocationAddressSearch();

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
  const cityField = useCheckRequiredLocationField({
    key: 'city',
    required: true,
    attempted,
  });
  const postalCodeField = useCheckRequiredLocationField({
    key: 'postalCode',
    required: true,
    attempted,
  });
  const provinceField = useCheckRequiredLocationField({
    key: 'province',
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

      {/*
       * TODO: Restore address autocomplete + auto-filled city/CAP/province once
       * an address search API with geocoding is available.
       * Use AppAutocomplete + useLocationAddressSearch (setLocationAddressFromOption
       * populates city/postalCode/province automatically — fields were disabled).
       *
       * <FormField label="Indirizzo" required {...addressField}>
       *   <AppAutocomplete
       *     inputValue={address || ''}
       *     options={addressOptions}
       *     onValueChange={handleAddressChange}
       *     onSelect={handleAddressSelect}
       *   />
       * </FormField>
       * {city && (
       *   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
       *     <AppTextField label="Città" value={city} disabled sx={{ flex: { xs: '1 1 100%', sm: 1 } }} />
       *     <AppTextField label="CAP" value={postalCode} disabled sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: 1 } }} />
       *     <AppTextField label="Provincia" value={province} disabled sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: 1 } }} />
       *   </Box>
       * )}
       */}

      <FormField
        value={address || ''}
        label="Indirizzo"
        required
        onChange={(e) => dispatch(setLocationAddress(e.target.value))}
        {...addressField}
      >
        <AppTextField />
      </FormField>

      <Box
        sx={{
          display: 'flex',
          gap: '20px',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <FormField
            value={city || ''}
            label="Città"
            required
            onChange={(e) => dispatch(setLocationCity(e.target.value))}
            {...cityField}
          >
            <AppTextField />
          </FormField>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormField
            value={postalCode || ''}
            label="CAP"
            required
            onChange={(e) => dispatch(setLocationPostalCode(e.target.value))}
            {...postalCodeField}
          >
            <AppTextField />
          </FormField>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormField
            value={province || ''}
            label="Provincia"
            required
            onChange={(e) => dispatch(setLocationProvince(e.target.value))}
            {...provinceField}
          >
            <AppTextField />
          </FormField>
        </Box>
      </Box>
    </Box>
  );
}

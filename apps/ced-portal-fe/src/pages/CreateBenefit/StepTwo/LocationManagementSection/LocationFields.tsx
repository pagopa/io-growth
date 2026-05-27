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
import { useLocationFieldValidations } from './hooks/useLocationFieldValidations';

interface LocationFieldsProps {
  attempted?: boolean;
}

interface FieldConfig {
  key: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  validation: ReturnType<typeof useCheckRequiredLocationField>;
}

function renderField(field: FieldConfig) {
  return (
    <FormField
      key={field.key}
      value={field.value}
      label={field.label}
      required
      onChange={(e) => field.onChange(e.target.value)}
      {...field.validation}
    >
      <AppTextField />
    </FormField>
  );
}

export function LocationFields({ attempted }: LocationFieldsProps) {
  const dispatch = useAppDispatch();
  const { name, address, city, postalCode, province } =
    useAppSelector(selectLocationForm);
  // TODO [OUT OF MVP SCOPE]: restore when an address search API with geocoding is available
  // const { addressOptions, handleAddressChange, handleAddressSelect } =
  //   useLocationAddressSearch();

  const {
    name: nameField,
    address: addressField,
    city: cityField,
    postalCode: postalCodeField,
    province: provinceField,
  } = useLocationFieldValidations(attempted);

  const singleFields: FieldConfig[] = [
    {
      key: 'name',
      label: 'Nome',
      value: name,
      onChange: (v) => dispatch(setLocationName(v)),
      validation: nameField,
    },
    {
      key: 'address',
      label: 'Indirizzo',
      value: address || '',
      onChange: (v) => dispatch(setLocationAddress(v)),
      validation: addressField,
    },
  ];

  const rowFields: FieldConfig[] = [
    {
      key: 'city',
      label: 'Città',
      value: city || '',
      onChange: (v) => dispatch(setLocationCity(v)),
      validation: cityField,
    },
    {
      key: 'postalCode',
      label: 'CAP',
      value: postalCode || '',
      onChange: (v) => dispatch(setLocationPostalCode(v)),
      validation: postalCodeField,
    },
    {
      key: 'province',
      label: 'Provincia',
      value: province || '',
      onChange: (v) => dispatch(setLocationProvince(v)),
      validation: provinceField,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {singleFields.map(renderField)}

      {/*
       * TODO: Restore address autocomplete + auto-filled city/CAP/province once
       * an address search API with geocoding is available.
       * Remove address from singleFields, render it separately with AppAutocomplete
       * via useLocationAddressSearch (setLocationAddressFromOption populates
       * city/postalCode/province automatically — rowFields would be disabled).
       *
       * const singleFields: FieldConfig[] = [
       *   { key: 'name', label: 'Nome', value: name, onChange: (v) => dispatch(setLocationName(v)), validation: nameField },
       * ];
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
       *   <Box sx={{ display: 'flex', gap: '20px', flexDirection: { xs: 'column', md: 'row' } }}>
       *     {rowFields.map((field) => (
       *       <Box key={field.key} sx={{ flex: 1 }}>
       *         <AppTextField label={field.label} value={field.value} disabled />
       *       </Box>
       *     ))}
       *   </Box>
       * )}
       */}

      <Box
        sx={{
          display: 'flex',
          gap: '20px',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {rowFields.map((field) => (
          <Box key={field.key} sx={{ flex: 1 }}>
            {renderField(field)}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

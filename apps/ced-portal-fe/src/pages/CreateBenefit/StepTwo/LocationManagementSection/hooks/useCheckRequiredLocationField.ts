import { selectLocationForm } from '../../../../../features/location/locationSlice';
import type { LocationStringFieldKey } from '../../../../../features/location/types';
import { useAppSelector } from '../../../../../hooks/store';
import { useCheckRequiredField } from '../../hooks/useCheckRequiredField';

type Params = {
  key: LocationStringFieldKey;
  required?: boolean;
  attempted?: boolean;
};

export const useCheckRequiredLocationField = ({
  key,
  required,
  attempted,
}: Params) => {
  const form = useAppSelector(selectLocationForm);
  return useCheckRequiredField({
    value: String(form[key] ?? ''),
    required,
    attempted,
  });
};

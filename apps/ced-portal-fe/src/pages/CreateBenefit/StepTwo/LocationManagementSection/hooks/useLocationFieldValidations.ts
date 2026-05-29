import { useCheckRequiredLocationField } from './useCheckRequiredLocationField';

export function useLocationFieldValidations(attempted?: boolean) {
  const name = useCheckRequiredLocationField({
    key: 'name',
    required: true,
    attempted,
  });
  const address = useCheckRequiredLocationField({
    key: 'address',
    required: true,
    attempted,
  });
  const city = useCheckRequiredLocationField({
    key: 'city',
    required: true,
    attempted,
  });
  const postalCode = useCheckRequiredLocationField({
    key: 'postalCode',
    required: true,
    attempted,
  });
  const province = useCheckRequiredLocationField({
    key: 'province',
    required: true,
    attempted,
  });
  return { name, address, city, postalCode, province };
}

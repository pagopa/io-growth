import {
  useCreatePlaceMutation,
  useLazySearchAddressesQuery,
} from '../places/api';
import type { Place } from '../places/types';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import {
  resetLocationForm,
  selectLocationForm,
  setLocationAddress,
  setLocationAddressFromOption,
} from './locationSlice';
import type { AddressOption } from '../places/types';

export function useLocationSubmit(
  onConfirm: (newLocation?: Place) => void,
  onClose: () => void,
  setAttempted: (v: boolean) => void,
) {
  const dispatch = useAppDispatch();
  const locationForm = useAppSelector(selectLocationForm);
  const [createPlace, { isLoading }] = useCreatePlaceMutation();

  const handleConfirm = async () => {
    setAttempted(true);
    const { name, address, city, postalCode, province, contacts } = locationForm;

    if (!name?.trim() || !address?.trim() || !city?.trim()) return;

    const supportContacts = contacts
      .filter((c) => c.type?.trim() && c.value?.trim())
      .map((c) => ({ type: c.type!.trim(), value: c.value!.trim() }));

    const result = await createPlace({
      type: 'offline',
      name: name.trim(),
      address: {
        street: address.trim(),
        city: city.trim(),
        state: province?.trim() ?? '',
        postalCode: postalCode?.trim() ?? '',
        country: 'IT',
      },
      supportContacts,
    });

    if ('error' in result) return;
    dispatch(resetLocationForm());
    onConfirm(result.data);
  };

  const handleClose = () => {
    dispatch(resetLocationForm());
    onClose();
  };

  return { handleConfirm, handleClose, isLoading };
}

export function useLocationAddressSearch() {
  const dispatch = useAppDispatch();
  const { address } = useAppSelector(selectLocationForm);
  const [triggerSearch, { data: addressOptions = [] }] =
    useLazySearchAddressesQuery();

  const handleAddressChange = (val: string) => {
    dispatch(setLocationAddress(val));
    if (val.trim().length >= 3) {
      void triggerSearch(val);
    }
  };

  return {
    addressOptions,
    handleAddressChange,
    handleAddressSelect: (option: AddressOption) =>
      dispatch(setLocationAddressFromOption(option)),
    address,
  };
}

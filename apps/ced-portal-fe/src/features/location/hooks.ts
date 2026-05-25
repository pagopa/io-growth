import {
  useCreatePlaceMutation,
  useLazyGetPlacesQuery,
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
import { useToast } from '../../contexts';

export function useLocationSubmit(
  onConfirm: (newLocation?: Place) => void,
  onClose: () => void,
  setAttempted: (v: boolean) => void,
) {
  const dispatch = useAppDispatch();
  const locationForm = useAppSelector(selectLocationForm);
  const [createPlace, { isLoading }] = useCreatePlaceMutation();
  const [triggerGetPlaces] = useLazyGetPlacesQuery();
  const { showToast } = useToast();

  const handleConfirm = async () => {
    setAttempted(true);
    const { name, address, city, postalCode, province, contacts } =
      locationForm;

    if (
      !name?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !postalCode?.trim() ||
      !province?.trim()
    )
      return;

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

    if ('error' in result) {
      showToast('Errore durante il salvataggio del luogo', 'error');
      return;
    }
    const placesResult = await triggerGetPlaces();
    if (placesResult.error) {
      showToast('Errore durante il recupero dei luoghi', 'error');
      return;
    }
    const newPlace = placesResult.data?.slice(-1)[0];
    dispatch(resetLocationForm());
    onConfirm(newPlace);
  };

  const handleClose = () => {
    dispatch(resetLocationForm());
    onClose();
  };

  return { handleConfirm, handleClose, isLoading };
}

// TODO: restore when an address search API with geocoding is available
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

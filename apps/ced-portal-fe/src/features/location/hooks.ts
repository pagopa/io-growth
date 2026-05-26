import { useCreatePlaceMutation, useGetPlacesQuery } from '../places/api';
import type { Place } from '../places/types';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { resetLocationForm, selectLocationForm } from './locationSlice';
import { useToast } from '../../contexts';

export function useLocationSubmit(
  onConfirm: (newLocation?: Place) => void,
  onClose: () => void,
  setAttempted: (v: boolean) => void,
) {
  const dispatch = useAppDispatch();
  const locationForm = useAppSelector(selectLocationForm);
  const [createPlace, { isLoading }] = useCreatePlaceMutation();
  const { refetch: refetchPlaces } = useGetPlacesQuery();
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
        state: province.trim(),
        postalCode: postalCode.trim(),
        country: 'IT',
      },
      supportContacts,
    });

    if ('error' in result)
      return showToast('Errore durante il salvataggio del luogo', 'error');
    const placesResult = await refetchPlaces();
    if (placesResult.error)
      return showToast('Errore durante il recupero dei luoghi', 'error');
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

// TODO [OUT OF MVP SCOPE]: restore when an address search API with geocoding is available
// export function useLocationAddressSearch(existingLocations: OfflinePlace[]) {
//   const dispatch = useAppDispatch();
//   const { address } = useAppSelector(selectLocationForm);
//
//   const searchAddress = address?.trim() || '';
//
//   const { data: rawAddressOptions = [] } = useSearchAddressesQuery(
//     searchAddress,
//     {
//       skip: searchAddress.length < 3,
//     },
//   );
//
//   const usedAddresses = useMemo(
//     () => new Set(existingLocations.map((s) => s.address.street.toLowerCase())),
//     [existingLocations],
//   );
//
//   const addressOptions = useMemo(
//     () =>
//       rawAddressOptions.filter(
//         (o) =>
//           o.label.toLowerCase().includes(searchAddress.toLowerCase()) &&
//           !usedAddresses.has(o.label.toLowerCase()),
//       ),
//     [rawAddressOptions, searchAddress, usedAddresses],
//   );
//
//   return {
//     addressOptions,
//     handleAddressChange: (val: string) => dispatch(setLocationAddress(val)),
//     handleAddressSelect: (option: AddressOption) =>
//       dispatch(setLocationAddressFromOption(option)),
//   };
// }

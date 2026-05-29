import { useCreatePlaceMutation, useGetPlacesQuery } from '../places/api';
import type { PlaceResponse } from '../../core/api/generated/model';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { resetLocationForm, selectLocationForm } from './locationSlice';
import { useToast } from '../../contexts';

export function useLocationSubmit(
  onConfirm: (newLocation?: PlaceResponse) => void,
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

    const supportContacts = contacts.filter((c) => c.value.trim());

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

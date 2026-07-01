import { useCreatePlaceMutation } from '../places/api';
import type { PlaceResponse } from '../../core/api/generated/model';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { resetLocationForm, selectLocationForm } from './locationSlice';
import { useToast } from '../../contexts';
import { isValidHttpsUrl } from '../../utils/urlValidator';

export function useLocationSubmit(
  onConfirm: (newLocation?: PlaceResponse) => void,
  onClose: () => void,
  setAttempted: (v: boolean) => void,
) {
  const dispatch = useAppDispatch();
  const locationForm = useAppSelector(selectLocationForm);
  const [createPlace, { isLoading }] = useCreatePlaceMutation();
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

    const areSupportContactsValid = supportContacts.every(({ type, value }) => {
      if (type === 'website') {
        return value.trim() && isValidHttpsUrl(value.trim());
      }
      return value.trim();
    });

    if (!areSupportContactsValid) return;

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
    const newPlace = result.data;
    dispatch(resetLocationForm());
    onConfirm(newPlace);
  };

  const handleClose = () => {
    dispatch(resetLocationForm());
    onClose();
  };

  return { handleConfirm, handleClose, isLoading };
}

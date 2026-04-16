import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { useCreateLocationMutation } from './api';
import { resetLocationForm, selectLocationForm } from './locationSlice';
import type { Location } from './types';

export function useLocationSubmit(
  onConfirm: (newLocation?: Location) => void,
  onClose: () => void,
) {
  const dispatch = useAppDispatch();
  const locationForm = useAppSelector(selectLocationForm);
  const [createLocation, { isLoading }] = useCreateLocationMutation();

  const handleConfirm = async () => {
    const { name, address, city, postalCode, province, contacts } = locationForm;
    const result = await createLocation({ name, address, city, postalCode, province, contacts });
    dispatch(resetLocationForm());
    const newLocation = 'data' in result ? result.data : undefined;
    onConfirm(newLocation);
  };

  const handleClose = () => {
    dispatch(resetLocationForm());
    onClose();
  };

  return { handleConfirm, handleClose, isLoading };
}

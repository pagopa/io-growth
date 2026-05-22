import { useCreatePlaceMutation } from '../places/api';
import type { Place } from '../places/types';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import {
  resetWebsiteForm,
  selectWebsiteForm,
  validateWebsiteUrl,
} from './websiteSlice';

export function useWebsiteSubmit(
  onConfirm: (newWebsite?: Place) => void,
  onClose: () => void,
  setAttempted: (v: boolean) => void,
) {
  const dispatch = useAppDispatch();
  const websiteForm = useAppSelector(selectWebsiteForm);
  const [createPlace, { isLoading }] = useCreatePlaceMutation();

  const handleConfirm = async () => {
    setAttempted(true);
    dispatch(validateWebsiteUrl());
    const { name, url, urlError, contacts } = websiteForm;

    if (!name?.trim() || !url?.trim() || urlError) return;

    const supportContacts = contacts
      .filter((c) => c.type?.trim() && c.value?.trim())
      .map((c) => ({ type: c.type!.trim(), value: c.value!.trim() }));

    const result = await createPlace({
      type: 'online',
      name: name.trim(),
      website: { url: url.trim() },
      supportContacts,
    });

    if ('error' in result) return;
    dispatch(resetWebsiteForm());
    onConfirm(result.data);
  };

  const handleClose = () => {
    dispatch(resetWebsiteForm());
    onClose();
  };

  return { handleConfirm, handleClose, isLoading };
}

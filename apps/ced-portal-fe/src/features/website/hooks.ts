import { useCreatePlaceMutation } from '../places/api';
import type { PlaceResponse } from '../../core/api/generated/model';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import {
  resetWebsiteForm,
  selectWebsiteForm,
  validateWebsiteUrl,
} from './websiteSlice';
import { useToast } from '../../contexts';
import { isValidHttpsUrl } from '../../utils';

export function useWebsiteSubmit(
  onConfirm: (newWebsite?: PlaceResponse) => void,
  onClose: () => void,
  setAttempted: (v: boolean) => void,
) {
  const dispatch = useAppDispatch();
  const websiteForm = useAppSelector(selectWebsiteForm);
  const [createPlace, { isLoading }] = useCreatePlaceMutation();
  const { showToast } = useToast();

  const handleConfirm = async () => {
    setAttempted(true);
    dispatch(validateWebsiteUrl());
    const { name, url, urlError, contacts } = websiteForm;

    if (!name?.trim() || !url?.trim() || urlError) return;

    const supportContacts = contacts.filter((c) => c.value.trim());

    const areSupportContactsValid = supportContacts.every(({ type, value }) => {
      if (type === 'website') {
        return value.trim() && isValidHttpsUrl(value.trim());
      }
      return value.trim();
    });

    if (!areSupportContactsValid) return;

    const result = await createPlace({
      type: 'online',
      name: name.trim(),
      website: { url: url.trim() },
      supportContacts,
    });

    if ('error' in result)
      return showToast('Errore durante il salvataggio del sito', 'error');
    const newWebsite = result.data;
    dispatch(resetWebsiteForm());
    onConfirm(newWebsite);
  };

  const handleClose = () => {
    dispatch(resetWebsiteForm());
    onClose();
  };

  return { handleConfirm, handleClose, isLoading };
}

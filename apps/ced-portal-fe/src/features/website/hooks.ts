import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { useCreateWebsiteMutation } from './api';
import {
  resetWebsiteForm,
  selectIsWebsiteFormValid,
  selectWebsiteForm,
  validateWebsiteUrl,
} from './websiteSlice';
import type { Website } from './types';

export function useWebsiteSubmit(
  onConfirm: (newWebsite?: Website) => void,
  onClose: () => void,
) {
  const dispatch = useAppDispatch();
  const websiteForm = useAppSelector(selectWebsiteForm);
  const isFormValid = useAppSelector(selectIsWebsiteFormValid);
  const [createWebsite, { isLoading }] = useCreateWebsiteMutation();

  const handleConfirm = async () => {
    if (!isFormValid) {
      dispatch(validateWebsiteUrl());
      return;
    }
    const { name, url, contacts } = websiteForm;
    const result = await createWebsite({
      name: name ?? '',
      url: url ?? '',
      contacts,
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

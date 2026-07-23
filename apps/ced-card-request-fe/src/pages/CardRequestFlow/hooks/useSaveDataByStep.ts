import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../contexts';
import { useCreateDraftRequestMutation } from '../../../features/request-form/api';
import { selectRequestForm } from '../../../features/request-form/selectors';
import { setStatus, setStatusField } from '../../../features/status/reducer';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { APP_ROUTES } from '../../../app/routeConfig';
import { useUploadPhotoMutation } from '../../../features/photo-upload/api';
import { selectB64Photo } from '../../../features/photo-upload/reducer';
import { selectIdLavorazione } from '../../../features/status/selectors';
import { useConfirmMutation } from '../../../features/confirmation/api';

export const useSaveDataByStep = (next: () => void) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [
    saveFirstDraft,
    { isError: isDraftError, isLoading: isDraftLoading, reset: resetDraft },
  ] = useCreateDraftRequestMutation();
  const [
    uploadPhoto,
    { isError: isPhotoError, isLoading: isPhotoLoading, reset: resetPhoto },
  ] = useUploadPhotoMutation();
  const [
    confirm,
    { isSuccess: isConfirmSuccess, isLoading: isConfirmLoading },
  ] = useConfirmMutation();

  const firstDraftForm = useAppSelector(selectRequestForm);
  const idLavorazione = useAppSelector(selectIdLavorazione);
  const photo = useAppSelector(selectB64Photo);

  const isLoading = isDraftLoading || isPhotoLoading || isConfirmLoading;

  const getIdempotencyKey = () => {
    const idempotencyKey = globalThis.crypto?.randomUUID?.();
    if (!idempotencyKey) {
      navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
      return '';
    }
    return idempotencyKey;
  };

  const saveFirstDraftData = async () => {
    const idempotencyKey = getIdempotencyKey();
    try {
      const response = await saveFirstDraft({
        body: firstDraftForm,
        idempotency_key: idempotencyKey,
      }).unwrap();
      if (response.idLavorazione) {
        dispatch(
          setStatus({
            idLavorazione: response.idLavorazione,
            state: response?.state,
          }),
        );
      }
      next();
    } catch {
      showToast(
        'Si è verificato un problema nel salvataggio dei dati. Riprova',
        'error',
      );
      return;
    }
  };

  const savePhoto = async () => {
    const idempotencyKey = getIdempotencyKey();
    try {
      if (!photo) return;
      await uploadPhoto({
        body: {
          fotoCED: photo,
          idLavorazione,
          informativaFoto: true,
        },
        idempotency_key: idempotencyKey,
      }).unwrap();
      next();
    } catch {
      showToast(
        'Si è verificato un problema nel salvataggio dei dati. Riprova',
        'error',
      );
      return;
    }
  };

  const confirmRequest = async () => {
    const idempotencyKey = getIdempotencyKey();
    try {
      const { data } = await confirm({
        body: {
          idLavorazione,
        },
        idempotency_key: idempotencyKey,
      }).unwrap();
      if ('numDomus' in data) {
        dispatch(
          setStatusField({
            field: 'numDomus',
            value: data?.numDomus ?? undefined,
          }),
        );
      }
    } catch {
      showToast(
        'Si è verificato un problema nel salvataggio dei dati. Riprova',
        'error',
      );
      return;
    }
  };

  return {
    saveFirstDraftData,
    savePhoto,
    confirmRequest,
    isLoading,
    isConfirmSuccess,
    isPhotoError,
    isDraftError,
    resetDraft,
    resetPhoto,
  };
};

import { useState } from 'react';
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

export const sanitazeObject = <T extends Record<string, unknown>>(data: T): T =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value,
    ]),
  ) as T;

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
  const [confirm, { isLoading: isConfirmLoading }] = useConfirmMutation();

  const [isActionLoading, setIsActionLoading] = useState(false);

  const firstDraftForm = useAppSelector(selectRequestForm);
  const sanitazedFirstDataForm = sanitazeObject(firstDraftForm);

  const idLavorazione = useAppSelector(selectIdLavorazione);
  const photo = useAppSelector(selectB64Photo);

  const isLoading =
    isDraftLoading || isPhotoLoading || isConfirmLoading || isActionLoading;

  const getIdempotencyKey = () => {
    const idempotencyKey = globalThis.crypto?.randomUUID?.();
    if (!idempotencyKey) {
      navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
      return '';
    }
    return idempotencyKey;
  };
  const saveFirstDraftData = async () => {
    setIsActionLoading(true);
    try {
      const idempotencyKey = getIdempotencyKey();
      const response = await saveFirstDraft({
        body: sanitazedFirstDataForm,
        idempotency_key: idempotencyKey,
      }).unwrap();

      if (response?.idLavorazione) {
        dispatch(
          setStatus({
            idLavorazione: response.idLavorazione,
            state: response?.state,
          }),
        );
      }
      next();
    } catch (error) {
      //TODO debug only
      localStorage.setItem('log-error', JSON.stringify(error));
      showToast(
        'Si è verificato un problema nel salvataggio dei dati. Riprova',
        'error',
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const savePhoto = async () => {
    if (!photo) return;
    setIsActionLoading(true);
    try {
      const idempotencyKey = getIdempotencyKey();
      await uploadPhoto({
        body: {
          fotoCED: photo,
          idLavorazione,
          informativaFoto: true,
        },
        idempotency_key: idempotencyKey,
      }).unwrap();
      next();
    } catch (error) {
      //TODO debug only
      localStorage.setItem('log-error', JSON.stringify(error));
      showToast(
        'Si è verificato un problema nel salvataggio dei dati. Riprova',
        'error',
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmRequest = async () => {
    setIsActionLoading(true);
    try {
      const idempotencyKey = getIdempotencyKey();
      const response = await confirm({
        body: {
          idLavorazione,
        },
        idempotency_key: idempotencyKey,
      }).unwrap();

      if (response.status === 200) {
        const { numDomus } = response.data;
        dispatch(
          setStatusField({
            field: 'numDomus',
            value: numDomus ?? undefined,
          }),
        );
      }

      navigate(APP_ROUTES.REQUEST_SUCCESS);
    } catch (error) {
      //TODO debug only
      localStorage.setItem('log-error', JSON.stringify(error));
      showToast(
        'Si è verificato un problema nel salvataggio dei dati. Riprova',
        'error',
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    saveFirstDraftData,
    savePhoto,
    confirmRequest,
    isLoading,
    isPhotoError,
    isDraftError,
    resetDraft,
    resetPhoto,
  };
};

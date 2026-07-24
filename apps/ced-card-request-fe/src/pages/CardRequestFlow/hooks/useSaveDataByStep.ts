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
  const [
    confirm,
    { isSuccess: isConfirmSuccess, isLoading: isConfirmLoading },
  ] = useConfirmMutation();

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
  const retryWithSameIdempotency = async <T>(
    fn: (idempotencyKey: string) => Promise<T>,
    retries = 3,
    delayMs = 1000,
  ): Promise<T> => {
    const idempotencyKey = getIdempotencyKey();
    if (!idempotencyKey) throw new Error('No idempotency key');

    let attempts = 0;

    while (attempts < retries) {
      try {
        attempts++;
        return await fn(idempotencyKey);
      } catch (error) {
        const errObj = error as {
          status?: number | string;
          originalStatus?: number | string;
          error?: string;
        };

        const status = errObj?.status ?? errObj?.originalStatus;
        const errorMessage = String(errObj?.error || '');

        const isNetworkTimeout =
          status === 'FETCH_ERROR' ||
          errorMessage.includes('Failed to fetch') ||
          status === 504 ||
          status === '504';

        if (!isNetworkTimeout || attempts >= retries) {
          throw error;
        }

        // Aspettiamo il delay prima di effettuare il tentativo successivo con la stessa idempotency-key
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('Max retries reached');
  };
  const saveFirstDraftData = async () => {
    setIsActionLoading(true);
    try {
      const response = await retryWithSameIdempotency(
        (idempotencyKey) =>
          saveFirstDraft({
            body: sanitazedFirstDataForm,
            idempotency_key: idempotencyKey,
          }).unwrap(),
        3,
      );

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
      await retryWithSameIdempotency(
        (idempotencyKey) =>
          uploadPhoto({
            body: {
              fotoCED: photo,
              idLavorazione,
              informativaFoto: true,
            },
            idempotency_key: idempotencyKey,
          }).unwrap(),
        3,
      );
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
      const response = await retryWithSameIdempotency(
        (idempotencyKey) =>
          confirm({
            body: {
              idLavorazione,
            },
            idempotency_key: idempotencyKey,
          }).unwrap(),
        3,
      );

      if (response) {
        const data = response?.data;
        if (data && 'numDomus' in data) {
          dispatch(
            setStatusField({
              field: 'numDomus',
              value: data?.numDomus ?? undefined,
            }),
          );
        }
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

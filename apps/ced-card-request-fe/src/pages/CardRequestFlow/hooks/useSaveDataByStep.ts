import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateDraftRequestMutation } from '../../../features/request-form/api';
import { selectRequestForm } from '../../../features/request-form/selectors';
import { setStatus, setStatusField } from '../../../features/status/reducer';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { APP_ROUTES } from '../../../app/routeConfig';
import { useUploadPhotoMutation } from '../../../features/photo-upload/api';
import { selectB64Photo } from '../../../features/photo-upload/reducer';
import { selectIdLavorazione } from '../../../features/status/selectors';
import { useConfirmMutation } from '../../../features/confirmation/api';
import { selectConfirmationPayload } from '../../../features/confirmation/reducer';
import { toApiDateTime } from '../../../features/request-form/date';
import { getErrorCodes } from '../../../utils';
import { createIdempotencyKeys } from '../utils/idempotency';

const sanitizeObject = <T extends Record<string, unknown>>(data: T): T =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ]),
  ) as T;

export const useSaveDataByStep = (next: () => void) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [
    saveFirstDraft,
    {
      isError: isDraftError,
      isLoading: isDraftLoading,
      error: draftError,
      reset: resetDraft,
    },
  ] = useCreateDraftRequestMutation();
  const [
    uploadPhoto,
    {
      isError: isPhotoError,
      isLoading: isPhotoLoading,
      error: photoError,
      reset: resetPhoto,
    },
  ] = useUploadPhotoMutation();
  const [
    confirm,
    {
      isError: isConfirmError,
      isLoading: isConfirmLoading,
      error: confirmError,
      reset: resetConfirm,
    },
  ] = useConfirmMutation();

  const [isActionLoading, setIsActionLoading] = useState(false);
  const keys = useRef(
    createIdempotencyKeys(() => {
      if (!globalThis.crypto?.randomUUID) {
        throw new Error('Unable to generate an idempotency key');
      }
      return globalThis.crypto.randomUUID();
    }),
  );

  const firstDraftForm = useAppSelector(selectRequestForm);
  const sanitizedFirstDataForm = sanitizeObject(firstDraftForm);
  const confirmationForm = useAppSelector(selectConfirmationPayload);
  const confirmationPayload = sanitizeObject({
    ...confirmationForm,
    dataSentenza: confirmationForm.dataSentenza
      ? toApiDateTime(confirmationForm.dataSentenza)
      : confirmationForm.dataSentenza,
  });

  const idLavorazione = useAppSelector(selectIdLavorazione);
  const photo = useAppSelector(selectB64Photo);

  const isLoading =
    isDraftLoading || isPhotoLoading || isConfirmLoading || isActionLoading;

  const saveFirstDraftData = async () => {
    setIsActionLoading(true);
    try {
      const idempotencyKey = keys.current.get('draft', sanitizedFirstDataForm);
      const response = await saveFirstDraft({
        body: sanitizedFirstDataForm,
        idempotency_key: idempotencyKey,
      }).unwrap();
      keys.current.clear('draft');

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
      if (error instanceof Error) {
        console.error('Unable to save draft', error);
        navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const savePhoto = async () => {
    if (!photo) return;
    setIsActionLoading(true);
    try {
      const body = { fotoCED: photo, idLavorazione, informativaFoto: true };
      const idempotencyKey = keys.current.get('photo', body);
      await uploadPhoto({
        body,
        idempotency_key: idempotencyKey,
      }).unwrap();
      keys.current.clear('photo');
      next();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Unable to upload photo', error);
        navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmRequest = async () => {
    setIsActionLoading(true);
    try {
      const body = { ...confirmationPayload, idLavorazione };
      const idempotencyKey = keys.current.get('confirm', body);
      const responseUnwrapped = await confirm({
        body,
        idempotency_key: idempotencyKey,
      }).unwrap();
      keys.current.clear('confirm');

      dispatch(
        setStatusField({
          field: 'numDomus',
          value: responseUnwrapped.numDomus ?? undefined,
        }),
      );

      navigate(APP_ROUTES.REQUEST_SUCCESS);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Unable to confirm request', error);
        navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
      }
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
    isConfirmError,
    draftErrorCode: getErrorCodes(draftError),
    photoErrorCode: getErrorCodes(photoError),
    confirmErrorCode: getErrorCodes(confirmError),
    draftError,
    photoError,
    confirmError,
    resetDraft,
    resetPhoto,
    resetConfirm,
  };
};

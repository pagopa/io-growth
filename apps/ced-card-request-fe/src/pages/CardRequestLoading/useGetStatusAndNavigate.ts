import { useNavigate } from 'react-router-dom';
import {
  useLazyGetDraftQuery,
  useLazyGetStatusQuery,
} from '../../features/read-only-apis/api';
import { APP_ROUTES } from '../../app/routeConfig';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../hooks';
import {
  resetForm as resetStatus,
  setStatus,
} from '../../features/status/reducer';
import {
  resetForm as resetRequestForm,
  setForm,
} from '../../features/request-form/reducer';
import {
  resetPhoto,
  setFile,
  setPreview,
} from '../../features/photo-upload/reducer';
import { resetForm as resetConfirmationForm } from '../../features/confirmation/reducer';
import { buildRecoveredDraftState } from '../../features/read-only-apis/draftRecovery';
import { runStatusNavigation } from './statusNavigation';
import { getErrorCodes } from '../../utils';
import { isNetworkError } from '../../utils/apiError';

export const useGetStatusAndNavigate = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const saveFieldFromStatus = useCallback(
    (data: Awaited<ReturnType<typeof getStatus>>['data']) => {
      if (!data) return;

      dispatch(resetStatus());
      dispatch(
        setStatus({
          idLavorazione: data.idLavorazione ?? '',
          numDomus: data.numDomus,
          state: data.state,
        }),
      );
    },
    [dispatch],
  );

  const [getStatus] = useLazyGetStatusQuery();
  const [getDraft] = useLazyGetDraftQuery();

  const resetDraft = useCallback(() => {
    dispatch(resetRequestForm());
    dispatch(resetPhoto());
    dispatch(resetConfirmationForm());
  }, [dispatch]);

  const recoverDraft = useCallback(async () => {
    const draft = await getDraft().unwrap();
    const recovered = buildRecoveredDraftState(draft);

    dispatch(setForm(recovered.requestForm));
    dispatch(resetPhoto());
    if (recovered.photoBase64 && recovered.photoPreview) {
      dispatch(setFile(recovered.photoBase64));
      dispatch(setPreview(recovered.photoPreview));
    }
  }, [dispatch, getDraft]);

  useEffect(() => {
    const retrieveStatus = async () => {
      let recovering = false;
      try {
        await runStatusNavigation({
          getStatus: () => getStatus().unwrap(),
          navigate,
          recoverDraft: async () => {
            recovering = true;
            await recoverDraft();
          },
          resetDraft,
          saveStatus: saveFieldFromStatus,
        });
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'data' in error) {
          const errorCode = getErrorCodes(error);
          if (errorCode?.length === 1 && errorCode[0] === 912) {
            dispatch(resetStatus());
            return navigate(APP_ROUTES.REQUEST_PENDING, { replace: true });
          }
          return navigate(APP_ROUTES.GENERIC_ERROR, {
            replace: true,
            state: {
              errorCode,
              recovering,
              retry: true,
              network: isNetworkError(error),
            },
          });
        }
        navigate(APP_ROUTES.GENERIC_ERROR, {
          replace: true,
          state: { recovering, retry: true, network: isNetworkError(error) },
        });
      }
    };

    retrieveStatus();
  }, [
    dispatch,
    getStatus,
    navigate,
    recoverDraft,
    resetDraft,
    saveFieldFromStatus,
  ]);
};

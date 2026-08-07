import { useNavigate } from 'react-router-dom';
import {
  useLazyGetDraftQuery,
  useLazyGetStatusQuery,
} from '../../features/read-only-apis/api';
import { APP_ROUTES } from '../../app/routeConfig';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../hooks';
import { setStatusField } from '../../features/status/reducer';
import { setForm } from '../../features/request-form/reducer';
import {
  resetPhoto,
  setFile,
  setPreview,
} from '../../features/photo-upload/reducer';
import { buildRecoveredDraftState } from '../../features/read-only-apis/draftRecovery';
import { runStatusNavigation } from './statusNavigation';

export const useGetStatusAndNavigate = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const saveFieldFromStatus = useCallback(
    (data: Awaited<ReturnType<typeof getStatus>>['data']) => {
      if (!data) return;

      dispatch(
        setStatusField({
          field: 'state',
          value: data.state,
        }),
      );

      if (data.idLavorazione) {
        dispatch(
          setStatusField({
            field: 'idLavorazione',
            value: data.idLavorazione,
          }),
        );
      }

      if (data.numDomus) {
        dispatch(
          setStatusField({
            field: 'numDomus',
            value: data.numDomus,
          }),
        );
      }
    },
    [dispatch],
  );

  const [getStatus] = useLazyGetStatusQuery();
  const [getDraft] = useLazyGetDraftQuery();

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
      try {
        await runStatusNavigation({
          getStatus: () => getStatus().unwrap(),
          navigate,
          recoverDraft,
          saveStatus: saveFieldFromStatus,
        });
      } catch (error) {
        localStorage.setItem('log-error', JSON.stringify(error));
        console.error(error);
        navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
      }
    };

    retrieveStatus();
  }, [getStatus, navigate, recoverDraft, saveFieldFromStatus]);
};

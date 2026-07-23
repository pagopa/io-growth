import { useNavigate } from 'react-router-dom';
import { useLazyGetStatusQuery } from '../../features/read-only-apis/api';
import { APP_ROUTES } from '../../app/routeConfig';
import { useEffect } from 'react';
import { useAppDispatch } from '../../hooks';
import { setStatusField } from '../../features/status/reducer';

export const useGetStatusAndNavigate = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [getStatus] = useLazyGetStatusQuery();

  useEffect(() => {
    const retrieveStatus = async () => {
      try {
        const status = await getStatus().unwrap();
        switch (status.state) {
          case 'READY_FOR_NEW_DRAFT':
            return navigate(APP_ROUTES.APPLICATION, { replace: true });
          case 'READY_FOR_PHOTO_UPLOAD':
            return navigate(APP_ROUTES.APPLICATION, {
              replace: true,
              state: { step: 2 },
            });
          case 'READY_FOR_DOCUMENTS_UPLOAD':
            return navigate(APP_ROUTES.APPLICATION, {
              replace: true,
              state: { step: 3 },
            });
          case 'ACQUIRED':
            if ('numDomus' in status) {
              dispatch(
                setStatusField({
                  field: 'numDomus',
                  value: String(status.numDomus),
                }),
              );
            }
            // TODO Temporary navigation
            return navigate(APP_ROUTES.REQUEST_SUCCESS, { replace: true });
          default:
            return navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
        }
      } catch (error) {
        console.error(error);
        return navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
      }
    };

    retrieveStatus();
  }, [dispatch, getStatus, navigate]);
};

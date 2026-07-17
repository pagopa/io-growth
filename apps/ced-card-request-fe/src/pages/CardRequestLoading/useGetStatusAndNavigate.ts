import { useNavigate } from 'react-router-dom';
import { useLazyGetStatusQuery } from '../../features/read-only-apis/api';
import { APP_ROUTES } from '../../app/routeConfig';
import { useEffect } from 'react';

export const useGetStatusAndNavigate = () => {
  const navigate = useNavigate();

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
            // TODO Temporary navigation
            return navigate(APP_ROUTES.REQUEST_SUCCESS, { replace: true });
          default:
            return;
        }
      } catch (error) {
        return navigate(APP_ROUTES.GENERIC_ERROR, { replace: true });
      }
    };

    retrieveStatus();
  }, [getStatus, navigate]);
};

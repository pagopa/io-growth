import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo } from 'react';
import { useLazyGetSessionQuery } from '../features/session/api';
import { APP_ROUTES } from '../app/routeConfig';
import {
  selectCachedSession,
  selectIsTokenValid,
} from '../core/auth/authSelectors';
import { isFetchBaseQueryError } from '../utils';
import { authActions } from '../core/auth/authSlice';

const redirectTokenError = { data: 'Session ID not provided', status: 401 };

export const useGetSession = () => {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const navigate = useNavigate();

  const redirectToken = useMemo(
    () => new URLSearchParams(search).get('id'),
    [search],
  );
  const deviceId = useMemo(
    () => new URLSearchParams(search).get('device'),
    [search],
  );

  const [getSession] = useLazyGetSessionQuery();

  const cachedSession = useSelector(selectCachedSession);
  const isChachedSessionValid = useSelector(selectIsTokenValid);

  const retrieveSession = useCallback(async () => {
    if (!redirectToken) {
      return navigate(APP_ROUTES.UNAUTHORIZED, {
        state: {
          status: redirectTokenError.status,
        },
      });
    }

    if (
      cachedSession?.redirectToken &&
      redirectToken === cachedSession.redirectToken
    ) {
      if (isChachedSessionValid) return navigate(APP_ROUTES.HOME);
      return navigate(APP_ROUTES.UNAUTHORIZED, {
        state: {
          status: redirectTokenError.status,
        },
      });
    }

    const {
      isError: sessionError,
      error: sessionErrorMsg,
      data,
    } = await getSession(redirectToken);

    if (sessionError && isFetchBaseQueryError(sessionErrorMsg)) {
      if (isChachedSessionValid && cachedSession) {
        return navigate(APP_ROUTES.HOME);
      }
      dispatch(authActions.clearToken());
      navigate(APP_ROUTES.UNAUTHORIZED, {
        state: {
          status: sessionErrorMsg.status,
        },
      });
      return;
    }
    if (data?.token) {
      dispatch(
        authActions.setToken({
          ...data,
          redirectToken,
          deviceId: deviceId ?? undefined,
        }),
      );

      navigate(APP_ROUTES.HOME);
    }
    return;
  }, [
    redirectToken,
    cachedSession,
    getSession,
    navigate,
    isChachedSessionValid,
    dispatch,
    deviceId,
  ]);

  useEffect(() => {
    retrieveSession();
  }, [retrieveSession]);
};

import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { APP_ROUTES } from '../app/routeConfig';
import { useAuthorize } from '../features/session/hooks';
import { useAppSelector } from './store';
import { selectToken } from '../core/auth/authSelectors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const DEV_ASSERTION_TOKEN = import.meta.env.VITE_DEV_ASSERTION_TOKEN;
const SESSION_EXCHANGE_KEY = 'ced-portal-last-session-exchange-id';
const ACS_EXCHANGE_KEY = 'ced-portal-last-acs-assertion-token';

export const useGetSession = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { authorize } = useAuthorize();
  const token = useAppSelector(selectToken);

  useEffect(() => {
    let isMounted = true;

    const retrieveSession = async () => {
      const params = new URLSearchParams(search);
      const redirectToken = params.get('id');
      const assertionToken = params.get('token') ?? params.get('jwt');

      if (!redirectToken) {
        if (assertionToken) {
          const lastAcsAssertionToken =
            window.sessionStorage.getItem(ACS_EXCHANGE_KEY);
          if (lastAcsAssertionToken === assertionToken) {
            return;
          }

          window.sessionStorage.setItem(ACS_EXCHANGE_KEY, assertionToken);
          const acsUrl = `${API_BASE_URL}/acs?token=${encodeURIComponent(assertionToken)}`;
          window.location.replace(acsUrl);
          return;
        }

        if (token) {
          navigate(APP_ROUTES.HOME, { replace: true });
          return;
        }

        if (import.meta.env.DEV && DEV_ASSERTION_TOKEN && !token) {
          navigate(
            `${APP_ROUTES.AUTHORIZE}?token=${encodeURIComponent(DEV_ASSERTION_TOKEN)}`,
            { replace: true },
          );
          return;
        }

        navigate(APP_ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      const lastSessionExchangeId =
        window.sessionStorage.getItem(SESSION_EXCHANGE_KEY);
      if (lastSessionExchangeId === redirectToken) {
        // If the user is already authenticated (normal navigation),
        // redirect directly. If the store is empty (page refresh),
        // clear the guard and repeat the exchange in the same cycle.
        if (token) {
          navigate(APP_ROUTES.HOME, { replace: true });
          return;
        }

        window.sessionStorage.removeItem(SESSION_EXCHANGE_KEY);
      }

      try {
        window.sessionStorage.setItem(SESSION_EXCHANGE_KEY, redirectToken);
        await authorize(redirectToken);

        if (!isMounted) {
          return;
        }

        navigate(APP_ROUTES.HOME, { replace: true });
      } catch {
        window.sessionStorage.removeItem(SESSION_EXCHANGE_KEY);
        if (isMounted) {
          navigate(APP_ROUTES.UNAUTHORIZED, { replace: true });
        }
      } finally {
        window.sessionStorage.removeItem(ACS_EXCHANGE_KEY);
      }
    };

    void retrieveSession();

    return () => {
      isMounted = false;
    };
  }, [authorize, navigate, search, token]);
};

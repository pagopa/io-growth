import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { APP_ROUTES } from '../app/routeConfig';
import { useAuthorize } from '../features/session/hooks';
import { useAppSelector } from './store';
import { selectToken, selectUser } from '../core/auth/authSelectors';
import { partyRoleMap } from '../components/PageHeader/constants';
import { devAuthStorage } from '../features/session/authDev/wrapper';
import {
  getDevAssertionToken,
  getLandingRoute,
  resolveRole,
} from '../features/session/authDev/utils';
import { API_BASE_URL } from '../features/session/authDev/constant';

export const useGetSession = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { authorize } = useAuthorize();
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectUser);

  const getCurrentRole = useCallback(() => {
    if (user?.role) {
      return user.role;
    }

    const savedPartyId = devAuthStorage.getSelectedPartyId();
    return savedPartyId ? (partyRoleMap[savedPartyId] ?? 'admin') : 'admin';
  }, [user?.role]);

  const navigateToLanding = useCallback(
    (role?: 'admin' | 'operator') => {
      navigate(getLandingRoute(role ?? getCurrentRole()), { replace: true });
    },
    [getCurrentRole, navigate],
  );

  useEffect(() => {
    let isMounted = true;

    const isValidToken = (value: unknown): value is string => {
      if (typeof value !== 'string') return false;

      return (
        value.length > 0 &&
        value.length <= 2048 &&
        /^[A-Za-z0-9\-._~+/]+=*$/.test(value)
      );
    };

    const retrieveSession = async () => {
      const params = new URLSearchParams(search);

      const rawRedirectToken = params.get('id');
      const rawAssertionToken = params.get('token') ?? params.get('jwt');

      const redirectToken = isValidToken(rawRedirectToken)
        ? rawRedirectToken
        : null;

      const assertionToken = isValidToken(rawAssertionToken)
        ? rawAssertionToken
        : null;

      if (!redirectToken) {
        if (assertionToken) {
          const last = devAuthStorage.getLastAcsToken();

          if (last === assertionToken) {
            return;
          }

          devAuthStorage.setLastAcsToken(assertionToken);

          const acsUrl = `${API_BASE_URL}/acs?token=${encodeURIComponent(assertionToken)}`;
          window.location.replace(acsUrl);
          return;
        }

        if (token) {
          navigateToLanding();
          return;
        }

        if (import.meta.env.DEV && !token) {
          const devToken = getDevAssertionToken(getCurrentRole());

          if (devToken && isValidToken(devToken)) {
            navigate(
              `${APP_ROUTES.AUTHORIZE}?token=${encodeURIComponent(devToken)}`,
              { replace: true },
            );
            return;
          }
        }

        navigate(APP_ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      const lastSessionExchangeId = devAuthStorage.getLastSessionExchangeId();

      if (lastSessionExchangeId === redirectToken) {
        if (token) {
          navigateToLanding();
          return;
        }
        devAuthStorage.removeLastSessionExchangeId();
      }

      try {
        devAuthStorage.setLastSessionExchangeId(redirectToken);
        const response = await authorize(redirectToken);

        if (!isMounted) return;
        const role = resolveRole(response.user_type ?? response.role);
        navigate(getLandingRoute(role), { replace: true });
      } catch {
        devAuthStorage.removeLastSessionExchangeId();

        if (isMounted) {
          navigate(APP_ROUTES.UNAUTHORIZED, { replace: true });
        }
      } finally {
        devAuthStorage.removeLastAcsToken();
      }
    };

    void retrieveSession();

    return () => {
      isMounted = false;
    };
  }, [authorize, getCurrentRole, navigate, navigateToLanding, search, token]);
};

import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../app/routeConfig';
import { useAuthorize } from '../features/session/hooks';
import { useAppSelector } from './store';
import { selectToken, selectUser } from '../core/auth/authSelectors';
import { partyRoleMap } from '../components/PageHeader/constants';
import { devAuthStorage } from '../features/session/authDev/wrapper';
import {
  getLandingRoute,
  resolveRole,
} from '../features/session/authDev/utils';
import type { AuthorizeResponseUserType } from '../generated/model';

export const useGetSession = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { authorize } = useAuthorize();
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectUser);

  const getCurrentRole = useCallback(() => {
    if (user?.user_type) {
      return user.user_type;
    }

    const savedPartyId = devAuthStorage.getSelectedPartyId();
    return savedPartyId ? (partyRoleMap[savedPartyId] ?? 'admin') : 'admin';
  }, [user?.user_type]);

  const navigateToLanding = useCallback(
    (role?: AuthorizeResponseUserType) => {
      if (role) return navigate(getLandingRoute(role), { replace: true });
      navigate(APP_ROUTES.UNAUTHORIZED);
    },
    [navigate],
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
      const searchParams = new URLSearchParams(search);
      const rawRedirectToken = searchParams.get('id');

      const redirectToken = isValidToken(rawRedirectToken)
        ? rawRedirectToken
        : null;

      if (!redirectToken) {
        if (token) {
          navigateToLanding(getCurrentRole());
          return;
        }

        navigate(APP_ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      const lastSessionExchangeId = devAuthStorage.getLastSessionExchangeId();

      if (lastSessionExchangeId === redirectToken) {
        if (token) {
          navigateToLanding(getCurrentRole());
          return;
        }
        devAuthStorage.removeLastSessionExchangeId();
      }

      try {
        devAuthStorage.setLastSessionExchangeId(redirectToken);
        const response = await authorize(redirectToken);

        if (!isMounted) return;
        const role = resolveRole(response.user_type);
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
  }, [
    authorize,
    getCurrentRole,
    navigate,
    navigateToLanding,
    search,
    token,
    user?.user_type,
  ]);
};

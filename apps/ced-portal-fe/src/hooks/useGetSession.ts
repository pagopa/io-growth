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
import { AuthorizeResponseUserType } from '../core/api/generated/model';

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
      console.log('🚀 ~ useGetSession ~ role:', role);
      if (role) return navigate(getLandingRoute(role), { replace: true });
      navigate(APP_ROUTES.UNAUTHORIZED);
    },
    [navigate],
  );

  useEffect(() => {
    console.log('effect');
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
        console.log('line___________ 68');

        if (assertionToken) {
          console.log('line___________ 71');

          const last = devAuthStorage.getLastAcsToken();

          if (last === assertionToken) {
            console.log('line___________ 76');
            return;
          }

          devAuthStorage.setLastAcsToken(assertionToken);

          const acsUrl = `${API_BASE_URL}/acs?token=${encodeURIComponent(assertionToken)}`;
          window.location.replace(acsUrl);
          console.log('line___________ 84');
          return;
        }

        if (token) {
          console.log('line___________ 89');
          navigateToLanding(user?.user_type);
          return;
        }

        if (import.meta.env.DEV && !token) {
          console.log('line___________ 95');

          const devToken = getDevAssertionToken(user?.user_type);

          if (devToken && isValidToken(devToken)) {
            console.log('line___________ 100');
            navigate(
              `${APP_ROUTES.AUTHORIZE}?token=${encodeURIComponent(devToken)}`,
              { replace: true },
            );
            return;
          }
        }

        console.log('line___________ 110');
        navigate(APP_ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      const lastSessionExchangeId = devAuthStorage.getLastSessionExchangeId();

      if (lastSessionExchangeId === redirectToken) {
        console.log('line___________ 117');
        if (token) {
          navigateToLanding(user?.user_type);
          return;
        }
        devAuthStorage.removeLastSessionExchangeId();
      }

      try {
        devAuthStorage.setLastSessionExchangeId(redirectToken);
        const response = await authorize(redirectToken);
        console.log('🚀 ~ retrieveSession ~ response:', response);

        if (!isMounted) return;
        const role = resolveRole(response.user_type);
        navigate(getLandingRoute(role), { replace: true });
      } catch {
        devAuthStorage.removeLastSessionExchangeId();

        if (isMounted) {
          console.log('line___________ 139');
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

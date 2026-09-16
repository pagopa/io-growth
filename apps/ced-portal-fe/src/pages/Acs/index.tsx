import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { API_BASE_URL } from '../../features/session/authDev/constant';
import { devAuthStorage } from '../../features/session/authDev/wrapper';

const isValidToken = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= 2048 &&
  /^[A-Za-z0-9\-._~+/]+=*$/.test(value);

const Acs = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(hash.slice(1));
    const rawAssertionToken = hashParams.get('token') ?? hashParams.get('jwt');

    if (!isValidToken(rawAssertionToken)) {
      navigate(APP_ROUTES.UNAUTHORIZED, { replace: true });
      return;
    }

    if (devAuthStorage.getLastAcsToken() === rawAssertionToken) {
      return;
    }

    let isMounted = true;
    devAuthStorage.setLastAcsToken(rawAssertionToken);

    const exchangeAssertionToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/acs`, {
          headers: { Authorization: `Bearer ${rawAssertionToken}` },
        });

        if (!response.ok) {
          throw new Error('ACS request failed');
        }

        const { sessionId } = (await response.json()) as {
          sessionId: unknown;
        };

        if (!isMounted || !isValidToken(sessionId)) {
          throw new Error('Invalid ACS response');
        }

        window.location.replace(
          `${APP_ROUTES.AUTHORIZE}?id=${encodeURIComponent(sessionId)}`,
        );
      } catch {
        devAuthStorage.removeLastAcsToken();

        if (isMounted) {
          navigate(APP_ROUTES.UNAUTHORIZED, { replace: true });
        }
      }
    };

    void exchangeAssertionToken();

    return () => {
      isMounted = false;
    };
  }, [hash, navigate]);

  return <div style={{ padding: 24 }}>Loading...</div>;
};

export default Acs;

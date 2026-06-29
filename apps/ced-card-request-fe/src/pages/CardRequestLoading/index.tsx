import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { MobileSpinnerLoader } from '@pagopa/io-core-ui';

const REDIRECT_DELAY_MS = 2000;

export default function CardRequestLoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      navigate(APP_ROUTES.APPLICATION, { replace: true });
    }, REDIRECT_DELAY_MS);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [navigate]);

  return <MobileSpinnerLoader title="Attendi qualche secondo" fullscreen />;
}

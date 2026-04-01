import { AppRoutes } from './app/routes';
import { trackEvent } from './core/analytics/trackEvent';

export default function App() {
  trackEvent('app_loaded');

  return <AppRoutes />;
}

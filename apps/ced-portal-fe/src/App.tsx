import { AppRoutes } from './app/routes';
import { useMixPanelSession } from './hooks/useMixPanelSession';

export default function App() {
  useMixPanelSession();
  return <AppRoutes />;
}

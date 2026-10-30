import { AppRoutes } from './app/routes';
import { useMixPanelSession } from './hooks';

export default function App() {
  useMixPanelSession();
  return <AppRoutes />;
}

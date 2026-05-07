import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routeConfig';
import { useAppSelector } from '../../hooks';
import { selectIsAuthenticated } from './authSelectors';

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to={APP_ROUTES.UNAUTHORIZED}
      />
    );
  }

  return <Outlet />;
}

import { MobileSpinnerLoader } from '@pagopa/io-core-ui';
import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '../core/auth/ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
import { useAppSelector } from '../hooks';
import {
  APP_ROUTES,
  ApplicationPage,
  Authorize,
  ConsentPage,
  GenericErrorPage,
  HomePage,
  LoadingPage,
  NotFoundPage,
  RequestErrorPage,
  RequestPendingPage,
  RequestSuccessPage,
  UnauthorizedPage,
} from './routeConfig';

export function AppRoutes() {
  const sessionExpired = useAppSelector((state) => state.auth.sessionExpired);
  const location = useLocation();

  if (
    sessionExpired &&
    location.pathname !== APP_ROUTES.UNAUTHORIZED &&
    location.pathname !== APP_ROUTES.AUTHORIZE
  ) {
    return <Navigate replace to={APP_ROUTES.UNAUTHORIZED} />;
  }

  return (
    <Suspense
      fallback={
        <MobileSpinnerLoader fullscreen title="Attendi qualche secondo" />
      }
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={APP_ROUTES.HOME} element={<HomePage />} />
          <Route path={APP_ROUTES.AUTHORIZE} element={<Authorize />} />
          <Route path={APP_ROUTES.CONSENT} element={<ConsentPage />} />
          <Route path={APP_ROUTES.LOADING} element={<LoadingPage />} />
          <Route path={APP_ROUTES.APPLICATION} element={<ApplicationPage />} />
          <Route
            path={APP_ROUTES.REQUEST_SUCCESS}
            element={<RequestSuccessPage />}
          />
          <Route
            path={APP_ROUTES.REQUEST_PENDING}
            element={<RequestPendingPage />}
          />
          <Route
            path={APP_ROUTES.REQUEST_ERROR}
            element={<RequestErrorPage />}
          />
          <Route element={<ProtectedRoute />} />
        </Route>
        <Route path={APP_ROUTES.GENERIC_ERROR} element={<GenericErrorPage />} />
        <Route path={APP_ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={APP_ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route
          path="*"
          element={<Navigate replace to={APP_ROUTES.NOT_FOUND} />}
        />
      </Routes>
    </Suspense>
  );
}

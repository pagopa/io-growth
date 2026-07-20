import { MobileSpinnerLoader } from '@pagopa/io-core-ui';
import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../core/auth/ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
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
  RequestSuccessPage,
  UnauthorizedPage,
} from './routeConfig';

export function AppRoutes() {
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

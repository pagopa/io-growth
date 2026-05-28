import { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../core/auth/ProtectedRoute';
import {
  APP_ROUTES,
  ApplicationPage,
  ConsentPage,
  HomePage,
  LoadingPage,
  NotFoundPage,
  UnauthorizedPage,
} from './routeConfig';

export function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={APP_ROUTES.HOME} element={<HomePage />} />
          <Route path={APP_ROUTES.CONSENT} element={<ConsentPage />} />
          <Route path={APP_ROUTES.LOADING} element={<LoadingPage />} />
          <Route path={APP_ROUTES.APPLICATION} element={<ApplicationPage />} />
          <Route element={<ProtectedRoute />} />
        </Route>
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

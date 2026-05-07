import { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import {
  APP_ROUTES,
  HomePage,
  NotFoundPage,
  UnauthorizedPage,
} from './routeConfig';
import { ProtectedRoute } from '../core/auth/ProtectedRoute';

export function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
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

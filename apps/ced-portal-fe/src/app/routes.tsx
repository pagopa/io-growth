import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../core/auth/ProtectedRoute';
import {
  APP_ROUTES,
  CreateBenefitPage,
  HomePage,
  OverviewPage,
  NotFoundPage,
  UnauthorizedPage,
} from './routeConfig';

export function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={APP_ROUTES.OVERVIEW} element={<OverviewPage />} />
          <Route path={APP_ROUTES.HOME} element={<HomePage />} />
          <Route
            path={APP_ROUTES.CREATE_BENEFIT}
            element={<CreateBenefitPage />}
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/app"
              element={<div style={{ padding: 24 }}>App area</div>}
            />
          </Route>
          <Route path={APP_ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Route>
        <Route path={APP_ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/app"
            element={<div style={{ padding: 24 }}>App area</div>}
          />
        </Route>
        <Route path={APP_ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

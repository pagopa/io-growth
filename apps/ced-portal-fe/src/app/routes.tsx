import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../core/auth/ProtectedRoute';
import {
  AgreementDetailCreationPage,
  APP_ROUTES,
  HomePage,
  NotFoundPage,
  UnauthorizedPage,
  WizardPage,
} from './routeConfig';

export function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={APP_ROUTES.HOME} element={<HomePage />} />
          <Route
            path={APP_ROUTES.AGREEMENT_DETAIL_CREATION}
            element={<AgreementDetailCreationPage />}
          />
<<<<<<< HEAD
=======
          <Route element={<ProtectedRoute />}>
            <Route
              path="/app"
              element={<div style={{ padding: 24 }}>App area</div>}
            />
          </Route>
          <Route path={APP_ROUTES.WIZARD} element={<WizardPage />} />
          <Route path={APP_ROUTES.NOT_FOUND} element={<NotFoundPage />} />
>>>>>>> cebf64c (feat: step 2 access points)
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

import { MobileSpinnerLoader } from '@pagopa/io-core-ui';
import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../core/auth/ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
import {
  APP_ROUTES,
  AuthorizePage,
  EntityAccessPointDetailPage,
  EntityAccessPointsPage,
  EntityDetailPage,
  EntityOpportunitiesPage,
  EuropeanOpportunitiesPage,
  HomePage,
  NotFoundPage,
  OpportunitiesListPage,
  OpportunityDetailPage,
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
          <Route index element={<HomePage />} />
          <Route path={APP_ROUTES.AUTHORIZE} element={<AuthorizePage />} />
          <Route
            path={APP_ROUTES.ENTITY_DETAIL}
            element={<EntityDetailPage />}
          />
          <Route
            path={APP_ROUTES.ENTITY_OPPORTUNITIES}
            element={<EntityOpportunitiesPage />}
          />
          <Route
            path={APP_ROUTES.ENTITY_ACCESS_POINTS}
            element={<EntityAccessPointsPage />}
          />
          <Route
            path={APP_ROUTES.ENTITY_ACCESS_POINT_DETAIL}
            element={<EntityAccessPointDetailPage />}
          />
          <Route
            path={APP_ROUTES.OPPORTUNITY_DETAIL}
            element={<OpportunityDetailPage />}
          />
          <Route
            path={APP_ROUTES.EUROPEAN_OPPORTUNITIES}
            element={<EuropeanOpportunitiesPage />}
          />
          <Route
            path={APP_ROUTES.OPPORTUNITIES_LIST}
            element={<OpportunitiesListPage />}
          />
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

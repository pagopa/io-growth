import { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../core/auth/ProtectedRoute';
import {
  APP_ROUTES,
  CardRequestInfoPage,
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
        <div
          style={{
            padding: 24,
          }}
        >
          Loading...
        </div>
      }
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
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
            path={APP_ROUTES.CARD_REQUEST_INFO}
            element={<CardRequestInfoPage />}
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

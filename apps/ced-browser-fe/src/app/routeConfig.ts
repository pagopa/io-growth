import { lazy } from 'react';

export const APP_ROUTES = {
  HOME: '/',
  ENTITY_DETAIL: '/enti/:id',
  ENTITY_OPPORTUNITIES: '/enti/:id/opportunita',
  ENTITY_ACCESS_POINTS: '/enti/:id/punti-di-accesso',
  EUROPEAN_OPPORTUNITIES: '/european-opportunities',
  NOT_FOUND: '/not-found',
  UNAUTHORIZED: '/unauthorized',
} as const;

export const HomePage = lazy(() => import('../pages/Home'));
export const EntityDetailPage = lazy(() => import('../pages/EntityDetail'));
export const EntityOpportunitiesPage = lazy(
  () => import('../pages/EntityOpportunities'),
);
export const EntityAccessPointsPage = lazy(
  () => import('../pages/EntityAccessPoints'),
);
export const EuropeanOpportunitiesPage = lazy(
  () => import('../pages/EuropeanOpportunities'),
);
export const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'));
export const NotFoundPage = lazy(() => import('../pages/NotFound'));

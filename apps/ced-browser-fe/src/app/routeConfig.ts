import { lazy } from 'react';

export const APP_ROUTES = {
  HOME: '/',
  EUROPEAN_OPPORTUNITIES: '/european-opportunities',
  NOT_FOUND: '/not-found',
  UNAUTHORIZED: '/unauthorized',
} as const;

export const HomePage = lazy(() => import('../pages/Home'));
export const EuropeanOpportunitiesPage = lazy(
  () => import('../pages/EuropeanOpportunities'),
);
export const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'));
export const NotFoundPage = lazy(() => import('../pages/NotFound'));

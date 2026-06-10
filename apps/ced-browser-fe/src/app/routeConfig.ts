import { lazy } from 'react';
import { generatePath } from 'react-router-dom';

export const APP_ROUTES = {
  HOME: '/',
  ENTITY_DETAIL: '/enti/:id',
  ENTITY_OPPORTUNITIES: '/enti/:id/opportunita',
  ENTITY_ACCESS_POINTS: '/enti/:id/punti-di-accesso',
  ENTITY_ACCESS_POINT_DETAIL: '/enti/:id/punti-di-accesso/:accessPointId',
  OPPORTUNITY_DETAIL: '/opportunita/:id',
  EUROPEAN_OPPORTUNITIES: '/european-opportunities',
  OPPORTUNITIES_LIST: '/opportunities',
  NOT_FOUND: '/not-found',
  AUTHORIZE: '/authorize',
  UNAUTHORIZED: '/unauthorized',
} as const;

export const toEntityAccessPointDetailRoute = (
  entityId: string,
  accessPointId: string,
) =>
  generatePath(APP_ROUTES.ENTITY_ACCESS_POINT_DETAIL, {
    id: entityId,
    accessPointId,
  });

export const toOpportunityDetailRoute = (opportunityId: string) =>
  generatePath(APP_ROUTES.OPPORTUNITY_DETAIL, {
    id: opportunityId,
  });

export const toEntityDetailRoute = (entityId: string) =>
  generatePath(APP_ROUTES.ENTITY_DETAIL, {
    id: entityId,
  });

export const HomePage = lazy(() => import('../pages/Home'));
export const AuthorizePage = lazy(() => import('../pages/Authorize'));
export const EntityDetailPage = lazy(() => import('../pages/EntityDetail'));
export const EntityOpportunitiesPage = lazy(
  () => import('../pages/EntityOpportunities'),
);
export const EntityAccessPointsPage = lazy(
  () => import('../pages/EntityAccessPoints'),
);
export const EntityAccessPointDetailPage = lazy(
  () => import('../pages/AccessPointDetail'),
);
export const OpportunityDetailPage = lazy(
  () => import('../pages/OpportunityDetail'),
);
export const EuropeanOpportunitiesPage = lazy(
  () => import('../pages/EuropeanOpportunities'),
);
export const OpportunitiesListPage = lazy(
  () => import('../pages/OpportunitiesList'),
);
export const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'));
export const NotFoundPage = lazy(() => import('../pages/NotFound'));

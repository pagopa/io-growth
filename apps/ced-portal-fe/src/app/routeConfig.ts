import { lazy } from 'react';

// TODO refactor route names based on this difference between entity and admin routes
const ENTITY_ROUTES = {
  HOME: '/ente/opportunita',
  OVERVIEW: '/ente/panoramica',
  OVERVIEW_COMPLETE_DATA: '/ente/panoramica/completa-dati',
  CREATE_BENEFIT: '/ente/opportunita/crea',
  ENTITY_OPPORTUNITY_DETAIL: '/ente/opportunita/:id',
} as const;

const ADMIN_ROUTES = {
  OPPORTUNITIES: '/admin/opportunita',
  OPPORTUNITY_DETAIL: '/admin/opportunita/:id',
  ENTITIES: '/admin/enti',
  ENTITY_DETAIL: '/admin/enti/:id',
} as const;

export const APP_ROUTES = {
  ...ENTITY_ROUTES,
  ...ADMIN_ROUTES,
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
} as const;

export const HomePage = lazy(() => import('../pages/Home'));
export const OverviewPage = lazy(() => import('../pages/Overview'));
export const OverviewCompleteDataPage = lazy(
  () => import('../pages/Overview/CompleteData'),
);
export const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'));
export const NotFoundPage = lazy(() => import('../pages/NotFound'));
export const CreateBenefitPage = lazy(() => import('../pages/CreateBenefit'));
export const OpportunitiesPage = lazy(() => import('../pages/Opportunities'));
export const OpportunityDetailPage = lazy(
  () => import('../pages/OpportunityDetail'),
);

export const EntityOpportunityDetailPage = lazy(
  () => import('../pages/EntityOpportunityDetail'),
);
export const EntitiesPage = lazy(() => import('../pages/Entities'));
export const EntityDetailPage = lazy(() => import('../pages/EntityDetail'));

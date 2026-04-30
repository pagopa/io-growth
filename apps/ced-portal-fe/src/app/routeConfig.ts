import { lazy } from 'react';

export const APP_ROUTES = {
  HOME: '/',
  OVERVIEW: '/panoramica',
  OVERVIEW_COMPLETE_DATA: '/panoramica/completa-dati',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
  CREATE_BENEFIT: '/agevolazioni/crea',
  BENEFITS: '/agevolazioni',
  ACCESS_POINTS: '/punti-di-accesso',
  OPPORTUNITIES: '/opportunita',
  OPPORTUNITY_DETAIL: '/opportunita/:id',
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

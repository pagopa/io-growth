import { lazy } from 'react';

export const APP_ROUTES = {
  HOME: '/',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
  CREATE_BENEFIT: '/agevolazioni/crea',
  BENEFITS: '/agevolazioni',
  ACCESS_POINTS: '/punti-di-accesso',
  OPPORTUNITIES: '/opportunita',
  OPPORTUNITY_DETAIL: '/opportunita/:id',
} as const;

export const HomePage = lazy(() => import('../pages/Home'));
export const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'));
export const NotFoundPage = lazy(() => import('../pages/NotFound'));
export const CreateBenefitPage = lazy(() => import('../pages/CreateBenefit'));
export const OpportunitiesPage = lazy(() => import('../pages/Opportunities'));
export const OpportunityDetailPage = lazy(
  () => import('../pages/OpportunityDetail'),
);

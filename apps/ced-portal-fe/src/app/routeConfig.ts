import { lazy } from 'react';

export const APP_ROUTES = {
  HOME: '/',
  OVERVIEW: '/panoramica',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
  CREATE_BENEFIT: '/agevolazioni/crea',
} as const;

export const HomePage = lazy(() => import('../pages/Home'));
export const OverviewPage = lazy(() => import('../pages/Overview'));
export const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'));
export const NotFoundPage = lazy(() => import('../pages/NotFound'));
export const CreateBenefitPage = lazy(() => import('../pages/CreateBenefit'));

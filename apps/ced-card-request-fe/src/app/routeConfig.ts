import { lazy } from 'react';

export const APP_ROUTES = {
  HOME: '/',
  CONSENT: '/consent',
  LOADING: '/loading',
  APPLICATION: '/application',
  NOT_FOUND: '/not-found',
  UNAUTHORIZED: '/unauthorized',
} as const;

export const HomePage = lazy(() => import('../pages/CardRequestInfo'));
export const ConsentPage = lazy(() => import('../pages/CardRequestConsent'));
export const LoadingPage = lazy(() => import('../pages/CardRequestLoading'));
export const ApplicationPage = lazy(() => import('../pages/CardRequestFlow'));
export const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'));
export const NotFoundPage = lazy(() => import('../pages/NotFound'));

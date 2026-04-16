import { lazy } from 'react';

export const APP_ROUTES = {
  HOME: '/',
  AGREEMENT_DETAIL_CREATION: '/agevolazioni/crea/dettagli',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
  WIZARD: '/app/wizard',
} as const;

export const HomePage = lazy(() => import('../pages/Home'));
export const AgreementDetailCreationPage = lazy(
  () => import('../pages/AgreementDetailCreation'),
);
export const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'));
export const NotFoundPage = lazy(() => import('../pages/NotFound'));
export const WizardPage = lazy(() => import('../pages/Wizard'));

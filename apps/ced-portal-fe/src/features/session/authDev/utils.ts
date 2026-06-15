import { APP_ROUTES } from '../../../app/routeConfig';
import {
  DEV_ADMIN_ASSERTION_TOKEN,
  DEV_OPERATOR_ASSERTION_TOKEN,
} from './constant';

export type Role = Extract<AuthorizeResponseUserType, 'admin' | 'operator'>;

export const resolveRole = (value?: string): Role =>
  value === 'admin' || value === 'test_admin' ? 'admin' : 'operator';

export const getLandingRoute = (role: Role): string =>
  role === 'admin' ? APP_ROUTES.OPPORTUNITIES : APP_ROUTES.HOME;

export const getDevAssertionToken = (role: Role): string | undefined =>
  role === 'admin' ? DEV_ADMIN_ASSERTION_TOKEN : DEV_OPERATOR_ASSERTION_TOKEN;

import { APP_ROUTES } from '../../../app/routeConfig';
import { AuthorizeResponseUserType } from '../../../core/api/generated/model';
import {
  DEV_ADMIN_ASSERTION_TOKEN,
  DEV_OPERATOR_ASSERTION_TOKEN,
} from './constant';

export type Role = Extract<AuthorizeResponseUserType, 'admin' | 'operator'>;

export const resolveRole = (value?: AuthorizeResponseUserType): Role =>
  value === 'admin' || value === 'test_admin' ? 'admin' : 'operator';

export const getLandingRoute = (role: AuthorizeResponseUserType): string =>
  role === 'admin' || role === 'test_admin'
    ? APP_ROUTES.OPPORTUNITIES
    : APP_ROUTES.HOME;

export const getDevAssertionToken = (
  role?: AuthorizeResponseUserType,
): string | undefined =>
  role === 'admin' || role === 'test_admin'
    ? DEV_ADMIN_ASSERTION_TOKEN
    : DEV_OPERATOR_ASSERTION_TOKEN;

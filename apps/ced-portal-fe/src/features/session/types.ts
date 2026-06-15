import type { AuthorizeResponseUserType } from '../../core/api/generated/model/authorizeResponseUserType';

export interface SessionPayload {
  first_name: string;
  last_name: string;
  operator_name: string;
  role?: 'admin' | 'operator';
  user_type?: AuthorizeResponseUserType;
  session_token: string;
}

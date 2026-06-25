import type { AuthorizeResponse } from '../api/generated/model';

export type UserRole = 'admin' | 'operator';

export interface AuthState {
  token: AuthorizeResponse['session_token'] | null;
  user: Omit<AuthorizeResponse, 'session_token'> | null;
}

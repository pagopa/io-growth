export type UserRole = 'admin' | 'operator';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

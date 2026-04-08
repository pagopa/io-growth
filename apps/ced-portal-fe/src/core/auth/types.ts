export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

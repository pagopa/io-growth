export interface SessionPayload {
  first_name: string;
  last_name: string;
  operator_name: string;
  role: 'admin' | 'operator';
  session_token: string;
}

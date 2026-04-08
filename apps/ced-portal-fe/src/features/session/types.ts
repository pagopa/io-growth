export interface SessionPayload {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

import type { UserType } from "./user-type.js";

export const SESSION_TTL_SECONDS = 28800;
export const ONE_TIME_SESSION_ID_TTL_SECONDS = 60;

export interface Session {
  readonly firstName: string;
  readonly lastName: string;
  readonly operatorExternalId: string;
  readonly operatorId?: string;
  readonly operatorName: string;
  readonly referentExternalId: string;
  readonly role: string;
  readonly userType: UserType;
}

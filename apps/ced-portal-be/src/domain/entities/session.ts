import type { UserType } from "./user-type.js";

export interface Session {
  readonly firstName: string;
  readonly lastName: string;
  readonly operatorId: string;
  readonly operatorName: string;
  readonly referentExternalId: string;
  readonly role: string;
  readonly userType: UserType;
}

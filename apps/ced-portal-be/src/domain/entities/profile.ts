import type { OperatorPlace } from "./place.js";

export interface CreateProfileInput {
  readonly displayName: string;
  readonly operatorId: string;
  readonly place: OperatorPlace;
}

export interface Profile {
  readonly displayName: string;
  readonly place: OperatorPlace;
}

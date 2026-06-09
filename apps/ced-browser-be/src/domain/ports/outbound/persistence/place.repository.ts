import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface AccessPointSearchAddress {
  city: string;
  postalCode: string;
  state: string;
  street: string;
}

export interface AccessPointSearchItem {
  address: AccessPointSearchAddress | null;
  entityId: string;
  id: string;
  name: string;
  type: "place" | "profile";
  url?: string;
}

export interface PlaceRepository {
  readonly findAllByFullText: (
    input: SearchAccessPointsInput,
  ) => Promise<Result<AccessPointSearchItem[], GenericError>>;
}

export interface SearchAccessPointsInput {
  limit?: number;
  query: string;
}

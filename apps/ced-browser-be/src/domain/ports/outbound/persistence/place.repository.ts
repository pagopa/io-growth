import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface AccessPointSearchAddress {
  city: string;
  postalCode: string;
  state: string;
  street: string;
}

export const ACCESS_POINT_TYPES = ["place", "profile"] as const;
export interface AccessPointSearchItem {
  address: AccessPointSearchAddress | null;
  entityId: string;
  id: string;
  name: string;
  type: AccessPointType;
  url?: string;
}

export type AccessPointType = (typeof ACCESS_POINT_TYPES)[number];

export const LANGUAGE_VALUES = ["en", "fr", "de", "sl", "it"] as const;
export interface AccessPointBenefit {
  discountType: "fixed_amount" | "percentage" | null;
  type: "discount" | "free" | "other" | "priority" | "reduced_fixed_price";
  value: null | number;
}

export interface AccessPointDetail {
  address: AccessPointSearchAddress | null;
  contacts: { phone?: string; website?: string };
  entityId: string;
  entityName: string;
  id: string;
  opportunities: AccessPointOpportunity[];
  relatedAccessPoints: RelatedAccessPoint[];
  title: string;
}

export interface AccessPointDetailInput {
  language: Language;
  placeId: string;
}

export interface AccessPointOpportunity {
  benefit: AccessPointBenefit;
  id: string;
  title: string;
}

export type Language = (typeof LANGUAGE_VALUES)[number];

export interface PlaceRepository {
  readonly findAllByFullText: (
    input: SearchAccessPointsInput,
  ) => Promise<Result<AccessPointSearchItem[], GenericError>>;
  readonly findById: (
    input: AccessPointDetailInput,
  ) => Promise<Result<AccessPointDetail | undefined, GenericError>>;
}

export interface RelatedAccessPoint {
  address: AccessPointSearchAddress | null;
  id: string;
  title: string;
}

export interface SearchAccessPointsInput {
  limit?: number;
  query: string;
}

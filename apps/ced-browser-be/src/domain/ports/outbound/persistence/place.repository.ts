import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface PlaceAddress {
  city: string;
  postalCode: string;
  state: string;
  street: string;
}

export const PLACE_TYPES = ["place", "profile"] as const;
export interface PlaceSearchItem {
  address: null | PlaceAddress;
  entityId: string;
  id: string;
  name: string;
  type: PlaceType;
  url?: string;
}

export type PlaceType = (typeof PLACE_TYPES)[number];

export const LANGUAGE_VALUES = ["en", "fr", "de", "sl", "it"] as const;
export type Language = (typeof LANGUAGE_VALUES)[number];

export interface PlaceBenefit {
  discountType: "fixed_amount" | "percentage" | null;
  type: "discount" | "free" | "other" | "priority" | "reduced_fixed_price";
  value: null | number;
}

export interface PlaceDetail {
  address: null | PlaceAddress;
  contacts: { phone?: string; website?: string };
  entityId: string;
  entityName: string;
  id: string;
  opportunities: PlaceOpportunity[];
  relatedPlaces: RelatedPlace[];
  title: string;
}

export interface PlaceDetailInput {
  language: Language;
  placeId: string;
}

export interface PlaceOpportunity {
  benefit: PlaceBenefit;
  id: string;
  title: string;
}

export interface PlaceRepository {
  readonly findAllByFullText: (
    input: SearchPlacesInput,
  ) => Promise<Result<PlaceSearchItem[], GenericError>>;
  readonly findById: (
    input: PlaceDetailInput,
  ) => Promise<Result<PlaceDetail | undefined, GenericError>>;
}

export interface RelatedPlace {
  address: null | PlaceAddress;
  id: string;
  title: string;
}

export interface SearchPlacesInput {
  limit?: number;
  query: string;
}

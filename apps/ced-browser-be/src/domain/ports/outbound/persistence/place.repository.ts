import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { Language } from "../../../entities/language.js";
import type { OperatorMetadata } from "../../../entities/operator.js";

export interface PlaceAddress {
  city: string;
  postalCode: string;
  state: string;
  street: string;
}

export interface PlaceBenefit {
  discountType: "fixed_amount" | "percentage" | null;
  type: "discount" | "free" | "other" | "priority" | "reduced_fixed_price";
  value: null | number;
}

export const PLACE_TYPES = ["place", "profile"] as const;
export interface PlaceDetail extends OperatorMetadata {
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

export interface PlaceSearchItem extends OperatorMetadata {
  address: null | PlaceAddress;
  entityId: string;
  id: string;
  name: string;
  type: PlaceType;
  url?: string;
}

export type PlaceType = (typeof PLACE_TYPES)[number];

export interface RelatedPlace {
  address: null | PlaceAddress;
  id: string;
  title: string;
}

export interface SearchPlacesInput {
  limit?: number;
  query: string;
}

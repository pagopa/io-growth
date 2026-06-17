import { z } from "zod";

import {
  LANGUAGE_VALUES,
  PLACE_TYPES,
} from "../../../../../domain/ports/outbound/persistence/place.repository.js";

export const SearchPlacesQueryParams = z.object({
  limit: z.coerce.number().int().positive().optional(),
  q: z.string().min(3),
});

const PlaceAddress = z.object({
  city: z.string(),
  postalCode: z.string(),
  state: z.string(),
  street: z.string(),
});

const PlaceSearchItem = z.object({
  address: PlaceAddress.nullable(),
  entityId: z.string(),
  id: z.string(),
  name: z.string(),
  type: z.enum(PLACE_TYPES),
  url: z.string().optional(),
});

export const SearchPlacesResponse = z.object({
  items: z.array(PlaceSearchItem),
  total: z.number(),
});

export const GetPlaceDetailPathParams = z.object({
  placeId: z.string(),
});

const PlaceDetailContacts = z.object({
  phone: z.string().optional(),
  website: z.string().optional(),
});

const PlaceBenefit = z.object({
  discountType: z.enum(["percentage", "fixed_amount"]).nullable().optional(),
  type: z.enum([
    "free",
    "reduced_fixed_price",
    "priority",
    "discount",
    "other",
  ]),
  value: z.number().int().nullable().optional(),
});

const PlaceDetailOpportunity = z.object({
  benefit: PlaceBenefit,
  id: z.string(),
  title: z.string(),
});

const PlaceDetailRelatedItem = z.object({
  address: PlaceAddress.nullable(),
  id: z.string(),
  title: z.string(),
});

export const GetPlaceDetailResponse = z.object({
  address: PlaceAddress.nullable(),
  contacts: PlaceDetailContacts,
  entityId: z.string(),
  entityName: z.string(),
  id: z.string(),
  opportunities: z.array(PlaceDetailOpportunity),
  relatedPlaces: z.array(PlaceDetailRelatedItem),
  title: z.string(),
});

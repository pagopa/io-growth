import { z } from "zod";

import {
  ACCESS_POINT_TYPES,
  LANGUAGE_VALUES,
} from "../../../../../domain/ports/outbound/persistence/place.repository.js";

export const SearchAccessPointsQueryParams = z.object({
  limit: z.coerce.number().int().positive().optional(),
  q: z.string().min(3),
});

const AccessPointSearchAddress = z.object({
  city: z.string(),
  postalCode: z.string(),
  state: z.string(),
  street: z.string(),
});

const AccessPointSearchItem = z.object({
  address: AccessPointSearchAddress.nullable(),
  entityId: z.string(),
  id: z.string(),
  name: z.string(),
  type: z.enum(ACCESS_POINT_TYPES),
  url: z.string().optional(),
});

export const SearchAccessPointsResponse = z.object({
  items: z.array(AccessPointSearchItem),
  total: z.number(),
});

export const GetAccessPointDetailPathParams = z.object({
  accessPointId: z.string(),
  entityId: z.string(),
});

export const GetAccessPointDetailQueryParams = z.object({
  language: z.enum(LANGUAGE_VALUES).optional(),
});

const AccessPointDetailContacts = z.object({
  phone: z.string().optional(),
  website: z.string().optional(),
});

const AccessPointDetailOpportunity = z.object({
  badgeLabel: z.string(),
  id: z.string(),
  title: z.string(),
});

const AccessPointDetailRelatedItem = z.object({
  address: AccessPointSearchAddress.nullable(),
  id: z.string(),
  title: z.string(),
});

export const GetAccessPointDetailResponse = z.object({
  address: AccessPointSearchAddress.nullable(),
  contacts: AccessPointDetailContacts,
  entityId: z.string(),
  entityName: z.string(),
  id: z.string(),
  opportunities: z.array(AccessPointDetailOpportunity),
  relatedAccessPoints: z.array(AccessPointDetailRelatedItem),
  title: z.string(),
});

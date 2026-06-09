import { z } from "zod";

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
  type: z.enum(["place", "profile"]),
  url: z.string().optional(),
});

export const SearchAccessPointsResponse = z.object({
  items: z.array(AccessPointSearchItem),
  total: z.number(),
});

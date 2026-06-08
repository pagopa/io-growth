import { z } from "zod";

const supportContactSchema = z.object({
  id: z.ulid(),
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1).max(2048),
});

const addressSchema = z.object({
  city: z.string().min(1).max(64),
  country: z.string().min(1).max(64),
  postalCode: z.string().min(1).max(64),
  state: z.string().min(1).max(64),
  street: z.string().min(1).max(512),
});

const websiteSchema = z.object({
  url: z.url().max(2048),
});

const placeBaseSchema = z.object({
  id: z.ulid(),
  name: z.string().min(1).max(512),
  supportContacts: z.array(supportContactSchema),
});

const offlinePlaceSchema = placeBaseSchema.extend({
  address: addressSchema,
  type: z.literal("offline"),
});

const onlinePlaceSchema = placeBaseSchema.extend({
  type: z.literal("online"),
  website: websiteSchema,
});

export const PlaceSchema = z.discriminatedUnion("type", [
  offlinePlaceSchema,
  onlinePlaceSchema,
]);

export type Place = z.infer<typeof PlaceSchema>;

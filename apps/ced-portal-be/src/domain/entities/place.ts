import { z } from "zod";

const newSupportContactSchema = z.object({
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1),
});

const supportContactSchema = newSupportContactSchema.extend({
  id: z.uuid(),
});

const addressSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  state: z.string().min(1),
  street: z.string().min(1),
});

const websiteSchema = z.object({
  url: z.url(),
});

const newPlaceBaseSchema = z.object({
  name: z.string().min(1),
  supportContacts: z.array(newSupportContactSchema),
});

const placeBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  supportContacts: z.array(supportContactSchema),
});

const newOfflinePlaceSchema = newPlaceBaseSchema.extend({
  address: addressSchema,
  type: z.literal("offline"),
});

const offlinePlaceSchema = placeBaseSchema.extend({
  address: addressSchema,
  type: z.literal("offline"),
});

const newOnlinePlaceSchema = newPlaceBaseSchema.extend({
  type: z.literal("online"),
  website: websiteSchema,
});

const onlinePlaceSchema = placeBaseSchema.extend({
  type: z.literal("online"),
  website: websiteSchema,
});

export const NewPlaceSchema = z.discriminatedUnion("type", [
  newOfflinePlaceSchema,
  newOnlinePlaceSchema,
]);

export type NewPlace = z.infer<typeof NewPlaceSchema>;

export const PlaceSchema = z.discriminatedUnion("type", [
  offlinePlaceSchema,
  onlinePlaceSchema,
]);

export type Place = z.infer<typeof PlaceSchema>;

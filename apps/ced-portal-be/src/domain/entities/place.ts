import { z } from "zod";

const supportContactSchema = z.object({
  id: z.ulid(),
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1),
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

const placeBaseSchema = z.object({
  id: z.ulid(),
  name: z.string().min(1),
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

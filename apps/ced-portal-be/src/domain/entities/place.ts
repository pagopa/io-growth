import { z } from "zod";

const SupportContactSchema = z.object({
  id: z.ulid(),
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1).max(2048),
});

const AddressSchema = z.object({
  city: z.string().min(1).max(64),
  country: z.string().min(1).max(64),
  postalCode: z.string().min(1).max(64),
  state: z.string().min(1).max(64),
  street: z.string().min(1).max(512),
});

const WebsiteSchema = z.object({
  url: z.url().max(2048),
});

const PlaceBaseSchema = z.object({
  id: z.ulid(),
  name: z.string().min(1).max(512),
  supportContacts: z.array(SupportContactSchema),
});

const OfflinePlaceSchema = PlaceBaseSchema.extend({
  address: AddressSchema,
  type: z.literal("offline"),
});

const OnlinePlaceSchema = PlaceBaseSchema.extend({
  type: z.literal("online"),
  website: WebsiteSchema,
});

export const PlaceSchema = z.discriminatedUnion("type", [
  OfflinePlaceSchema,
  OnlinePlaceSchema,
]);

export type Place = z.infer<typeof PlaceSchema>;

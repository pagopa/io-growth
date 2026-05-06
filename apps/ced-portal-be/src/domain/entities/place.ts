import { z } from "zod";

import { SupportContactSchema } from "./support-contact.js";

export const AddressSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  street: z.string().min(1),
});

export type Address = z.infer<typeof AddressSchema>;

export const OfflinePlaceSchema = z.object({
  address: AddressSchema,
  name: z.string().min(1),
  supportContacts: z.array(SupportContactSchema),
  type: z.literal("offline"),
});

export type OfflinePlace = z.infer<typeof OfflinePlaceSchema>;

export const OnlinePlaceSchema = z.object({
  name: z.string().min(1),
  supportContacts: z.array(SupportContactSchema),
  type: z.literal("online"),
  website: z.string().url(),
});

export type OnlinePlace = z.infer<typeof OnlinePlaceSchema>;

export const OperatorPlaceSchema = z.discriminatedUnion("type", [
  OfflinePlaceSchema,
  OnlinePlaceSchema,
]);

export type OperatorPlace = z.infer<typeof OperatorPlaceSchema>;

import { z } from "zod";

import { NewPlaceSchema, PlaceSchema } from "./place.js";

export const NewProfileSchema = z.object({
  displayName: z.string().min(1),
  operatorId: z.uuid(),
  place: NewPlaceSchema,
});

export type NewProfile = z.infer<typeof NewProfileSchema>;

export const ProfileSchema = z.object({
  displayName: z.string().min(1),
  operatorId: z.uuid(),
  place: PlaceSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;

import { z } from "zod";

import { OperatorPlaceSchema } from "./place.js";

export const CreateProfileInputSchema = z.object({
  displayName: z.string().min(1),
  operatorId: z.string().min(1),
  place: OperatorPlaceSchema,
});

export type CreateProfileInput = z.infer<typeof CreateProfileInputSchema>;

export const ProfileSchema = z.object({
  displayName: z.string().min(1),
  place: OperatorPlaceSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;

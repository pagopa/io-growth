import { z } from "zod";

import { PlaceSchema } from "./place.js";

export const ProfileSchema = z.object({
  displayName: z.string().min(1),
  operatorId: z.ulid(),
  place: PlaceSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;

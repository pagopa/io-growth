import { z } from "zod";

import { PlaceSchema } from "./place.js";

export const ProfileSchema = z.object({
  // Not yet collected on profile creation; populated out-of-band. Optional
  // until every profile has one.
  contactEmail: z.string().email().optional(),
  displayName: z.string().min(1),
  operatorId: z.ulid(),
  place: PlaceSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;

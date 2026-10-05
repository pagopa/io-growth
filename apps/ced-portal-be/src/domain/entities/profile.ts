import { z } from "zod";

import { PlaceSchema } from "./place.js";

export const ProfileLegalUrlSchema = z
  .url({ protocol: /^https$/ })
  .max(2048)
  .regex(/^https:\/\//i);

export const ProfileSchema = z.object({
  contactEmail: z.email().max(512),
  displayName: z.string().min(1),
  operatorId: z.ulid(),
  place: PlaceSchema,
  privacyUrl: ProfileLegalUrlSchema,
  tosUrl: ProfileLegalUrlSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;

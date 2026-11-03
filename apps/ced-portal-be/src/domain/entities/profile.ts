import { z } from "zod";

import { HttpsUrlSchema } from "../value-objects/https-url.js";
import { PlaceSchema } from "./place.js";

export const ProfileLegalUrlSchema = HttpsUrlSchema.max(2048);

export const ProfileSchema = z.object({
  contactEmail: z.email().max(512),
  displayName: z.string().min(1),
  operatorId: z.ulid(),
  place: PlaceSchema,
  privacyUrl: ProfileLegalUrlSchema,
  tosUrl: ProfileLegalUrlSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;

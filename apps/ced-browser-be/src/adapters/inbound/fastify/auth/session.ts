import { z } from "zod";

export const CitizenSessionSchema = z.object({
  familyName: z.string(),
  fiscalCode: z.string(),
  givenName: z.string(),
});

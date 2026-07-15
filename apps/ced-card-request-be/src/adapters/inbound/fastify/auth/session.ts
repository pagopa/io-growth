import { z } from "zod";

/**
 * Shape of the FIMS session persisted in Redis for ced-card-request-be.
 * Mirrors `FimsSession` from `@pagopa/io-core-adapter-fims`.
 */
export const CardRequestSessionSchema = z.object({
  familyName: z.string(),
  fiscalCode: z.string(),
  givenName: z.string(),
});

export type CardRequestSession = z.infer<typeof CardRequestSessionSchema>;

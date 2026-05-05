import { z } from "zod";

/**
 * Zod schema matching the Session entity stored by the authentication preHandler.
 * Used as a StandardSchema for runtime-validated session extraction in handlers.
 *
 * Each handler can use this full schema or define a narrower one
 * (e.g. `OperatorSessionSchema`) to extract only the fields it needs.
 */
export const SessionSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  operatorId: z.string(),
  operatorName: z.string(),
  referentExternalId: z.string(),
  role: z.string(),
});

/**
 * Minimal session schema for routes that only need the operator identity.
 */
export const OperatorSessionSchema = SessionSchema.pick({
  operatorId: true,
});

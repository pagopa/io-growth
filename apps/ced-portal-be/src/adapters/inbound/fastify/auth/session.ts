import { z } from "zod";

import { USER_TYPES } from "../../../../domain/entities/user-type.js";

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
  operatorExternalId: z.string(),
  operatorId: z.string().optional(),
  operatorName: z.string(),
  referentExternalId: z.string(),
  role: z.string(),
  userType: z.enum(USER_TYPES),
});

/**
 * Minimal session schema for routes that only need the operator identity.
 */
export const OperatorSessionSchema = SessionSchema.pick({
  operatorId: true,
}).required();

export const UserTypeSessionSchema = SessionSchema.pick({
  userType: true,
});

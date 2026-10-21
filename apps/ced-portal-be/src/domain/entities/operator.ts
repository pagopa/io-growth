import { z } from "zod";

export const OPERATOR_STATUS = {
  ACTIVE: "active",
  REVOKED: "revoked",
  SUSPENDED: "suspended",
} as const;

export const OperatorSchema = z.object({
  externalId: z.uuid(),
  fiscalCode: z.string().min(1).max(32),
  id: z.ulid(),
  name: z.string().min(1).max(512),
  status: z.enum(OPERATOR_STATUS),
});

export type Operator = z.infer<typeof OperatorSchema>;

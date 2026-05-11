import { z } from "zod";

export const OperatorSchema = z.object({
  externalId: z.uuid(),
  id: z.ulid(),
  name: z.string().min(1),
  status: z.enum(["active"]),
});

export type Operator = z.infer<typeof OperatorSchema>;

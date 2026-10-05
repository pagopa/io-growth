import { z } from "zod";

export const OperatorMetadataSchema = z.object({
  operatorFiscalCode: z.string().min(1).max(32),
  operatorName: z.string().min(1).max(512),
});

export type OperatorMetadata = z.infer<typeof OperatorMetadataSchema>;

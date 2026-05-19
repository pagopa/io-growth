import { z } from "zod";

export const OpportunityCategorySchema = z.object({
  description: z.string().min(1),
  id: z.ulid(),
  title: z.string().min(1),
});

export type OpportunityCategory = z.infer<typeof OpportunityCategorySchema>;

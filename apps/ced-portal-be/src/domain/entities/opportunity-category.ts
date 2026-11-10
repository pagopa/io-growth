import { z } from "zod";

export const OPPORTUNITY_CATEGORY_LABEL = [
  "culture_sport",
  "education_employment",
  "health_wellbeing",
  "financial_services",
  "travel_tourism",
  "mobility_transport",
  "citizen_services",
  "municipal_services",
] as const;

export const OpportunityCategorySchema = z.object({
  id: z.ulid(),
  label: z.enum(OPPORTUNITY_CATEGORY_LABEL),
});

export type OpportunityCategory = z.infer<typeof OpportunityCategorySchema>;

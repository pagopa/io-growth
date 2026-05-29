import { z } from "zod";

export const OnboardingStatusSchema = z.enum([
  "REQUEST",
  "TOBEVALIDATED",
  "PENDING",
  "PENDING_IN_REVIEW",
  "COMPLETED",
  "FAILED",
  "REJECTED",
  "DELETED",
]);

export type OnboardingStatus = z.infer<typeof OnboardingStatusSchema>;

export const OnboardingInstitutionSchema = z.object({
  city: z.string().optional(),
  county: z.string().optional(),
  description: z.string().optional(),
  digitalAddress: z.string().optional(),
  id: z.string().optional(),
  taxCode: z.string().optional(),
});

export type OnboardingInstitution = z.infer<typeof OnboardingInstitutionSchema>;

export const OnboardingSchema = z.object({
  createdAt: z.string().optional(),
  id: z.string().optional(),
  institution: OnboardingInstitutionSchema.optional(),
  opportunityCount: z.number().optional(),
  productId: z.string().optional(),
  status: OnboardingStatusSchema.optional(),
  updatedAt: z.string().optional(),
  workflowType: z.string().optional(),
});

export type Onboarding = z.infer<typeof OnboardingSchema>;

export const PaginatedOnboardingsSchema = z.object({
  count: z.number(),
  items: z.array(OnboardingSchema),
});

export type PaginatedOnboardings = z.infer<typeof PaginatedOnboardingsSchema>;

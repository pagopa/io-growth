import { z } from "zod";

const BenefitFreeSchema = z.object({
  id: z.ulid(),
  type: z.literal("free"),
});

const BenefitPrioritySchema = z.object({
  id: z.ulid(),
  type: z.literal("priority"),
});

const BenefitReducedFixedPriceSchema = z.object({
  id: z.ulid(),
  type: z.literal("reduced_fixed_price"),
  value: z.number().int(),
});

const BenefitDiscountSchema = z.object({
  discountType: z.enum(["percentage", "fixed_amount"]),
  id: z.ulid(),
  type: z.literal("discount"),
  value: z.number().int(),
});

const BenefitOtherSchema = z.object({
  description: z.string().min(1).max(4096),
  id: z.ulid(),
  type: z.literal("other"),
});

export const BenefitSchema = z.discriminatedUnion("type", [
  BenefitFreeSchema,
  BenefitPrioritySchema,
  BenefitReducedFixedPriceSchema,
  BenefitDiscountSchema,
  BenefitOtherSchema,
]);

export type Benefit = z.infer<typeof BenefitSchema>;

const localizedMetadataSchema = z.object({
  id: z.ulid(),
  key: z.enum(["name", "description", "condition"]),
  language: z.enum(["en", "fr", "de", "sl", "it"]),
  value: z.string().min(1),
});

export const OpportunitySchema = z.object({
  beneficiaryBenefit: BenefitSchema,
  caregiverBenefit: BenefitSchema.optional(),
  categoryId: z.ulid(),
  dateFrom: z.iso.date(),
  dateTo: z.iso.date().optional(),
  id: z.ulid(),
  localizedMetadata: z.array(localizedMetadataSchema).min(1),
  nationalTerritory: z.boolean(),
  placeIds: z.array(z.ulid()),
  status: z.enum([
    "draft",
    "test_pending",
    "test_rejected",
    "test_passed",
    "published",
    "suspended",
    "deleted",
  ]),
  url: z.url().max(2048).optional(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;

export const BenefitSummarySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("free") }),
  z.object({ type: z.literal("priority") }),
  z.object({
    type: z.literal("reduced_fixed_price"),
    value: z.number().int(),
  }),
  z.object({
    discountType: z.enum(["percentage", "fixed_amount"]),
    type: z.literal("discount"),
    value: z.number().int(),
  }),
  z.object({
    description: z.string().max(4096),
    type: z.literal("other"),
  }),
]);

export type BenefitSummary = z.infer<typeof BenefitSummarySchema>;

export const OpportunitySummarySchema = z.object({
  categoryTitle: z.string(),
  dateFrom: z.string(),
  dateTo: z.string().nullable(),
  deletionMessage: z.string().max(4096).nullish(),
  id: z.ulid(),
  name: z.string(),
  operatorName: z.string(),
  status: z.enum([
    "draft",
    "test_pending",
    "test_rejected",
    "test_passed",
    "published",
    "scheduled",
    "scheduled_suspension",
    "suspended",
    "deleted",
  ]),
  suspendedByType: z.enum(["operator", "department"]).nullish(),
  suspendFrom: z.string().nullish(),
});

export type OpportunitySummary = z.infer<typeof OpportunitySummarySchema>;

// Derived, response-only statuses:
// - "scheduled": published opportunity whose dateFrom is still in the future.
// - "scheduled_suspension": published, live opportunity with a future suspendFrom.
// Both are computed from stored columns; the DB status column stays "published".
export const deriveOpportunityDisplayStatus = (
  status: OpportunitySummary["status"],
  dateFrom: string,
  referenceDate?: string,
  suspendFrom?: null | string,
): OpportunitySummary["status"] => {
  if (status !== "published" || !referenceDate) return status;
  if (dateFrom > referenceDate) return "scheduled";
  if (suspendFrom && suspendFrom > referenceDate) return "scheduled_suspension";
  return status;
};

const localizedMetadataSummarySchema = z.object({
  key: z.enum(["name", "description", "condition"]),
  language: z.enum(["en", "fr", "de", "sl", "it"]),
  value: z.string().min(1),
});

export const OpportunityDetailSchema = z.object({
  beneficiaryBenefit: BenefitSummarySchema,
  caregiverBenefit: BenefitSummarySchema.nullable(),
  categoryId: z.ulid(),
  categoryTitle: z.string(),
  createdAt: z.string(),
  dateFrom: z.string(),
  dateTo: z.string().nullable(),
  deletionMessage: z.string().max(4096).nullish(),
  id: z.ulid(),
  localizedMetadata: z.array(localizedMetadataSummarySchema),
  nationalTerritory: z.boolean(),
  operatorName: z.string().optional(),
  placeIds: z.array(z.ulid()),
  status: z.enum([
    "draft",
    "test_pending",
    "test_rejected",
    "test_passed",
    "published",
    "scheduled",
    "scheduled_suspension",
    "suspended",
    "deleted",
  ]),
  suspendedByType: z.enum(["operator", "department"]).nullish(),
  suspendFrom: z.string().nullish(),
  suspensionMessage: z.string().max(4096).nullish(),
  updatedAt: z.string(),
  url: z.url().max(2048).nullable(),
});

export type OpportunityDetail = z.infer<typeof OpportunityDetailSchema>;

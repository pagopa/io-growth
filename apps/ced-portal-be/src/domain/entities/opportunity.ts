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
  description: z.string().min(1),
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
  placeIds: z.array(z.ulid()).min(1),
  status: z.enum([
    "draft",
    "test_pending",
    "test_passed",
    "published",
    "suspended",
    "deleted",
  ]),
  url: z.string().url().optional(),
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
    description: z.string(),
    type: z.literal("other"),
  }),
]);

export type BenefitSummary = z.infer<typeof BenefitSummarySchema>;

export const OpportunitySummarySchema = z.object({
  categoryTitle: z.string(),
  dateFrom: z.string(),
  dateTo: z.string().nullable(),
  id: z.ulid(),
  name: z.string(),
  status: z.enum([
    "draft",
    "test_pending",
    "test_passed",
    "published",
    "suspended",
    "deleted",
  ]),
});

export type OpportunitySummary = z.infer<typeof OpportunitySummarySchema>;

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
  id: z.ulid(),
  localizedMetadata: z.array(localizedMetadataSummarySchema),
  placeIds: z.array(z.ulid()),
  status: z.enum([
    "draft",
    "test_pending",
    "test_passed",
    "published",
    "suspended",
    "deleted",
  ]),
  updatedAt: z.string(),
  url: z.string().url().nullable(),
});

export type OpportunityDetail = z.infer<typeof OpportunityDetailSchema>;

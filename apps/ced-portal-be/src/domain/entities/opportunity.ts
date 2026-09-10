import { z } from "zod";

export const BENEFIT_TYPE = {
  DISCOUNT: "discount",
  FREE: "free",
  OTHER: "other",
  PRIORITY: "priority",
  REDUCED_FIXED_PRICE: "reduced_fixed_price",
} as const;

export const BENEFIT_DISCOUNT_TYPE = {
  FIXED_AMOUNT: "fixed_amount",
  PERCENTAGE: "percentage",
} as const;

const BenefitFreeSchema = z.object({
  id: z.ulid(),
  type: z.literal(BENEFIT_TYPE.FREE),
});

const BenefitPrioritySchema = z.object({
  id: z.ulid(),
  type: z.literal(BENEFIT_TYPE.PRIORITY),
});

const BenefitReducedFixedPriceSchema = z.object({
  id: z.ulid(),
  type: z.literal(BENEFIT_TYPE.REDUCED_FIXED_PRICE),
  value: z.number().int(),
});

const BenefitDiscountSchema = z.object({
  discountType: z.enum(BENEFIT_DISCOUNT_TYPE),
  id: z.ulid(),
  type: z.literal(BENEFIT_TYPE.DISCOUNT),
  value: z.number().int(),
});

const BenefitOtherSchema = z.object({
  description: z.string().min(1).max(4096),
  id: z.ulid(),
  type: z.literal(BENEFIT_TYPE.OTHER),
});

export const BenefitSchema = z.discriminatedUnion("type", [
  BenefitFreeSchema,
  BenefitPrioritySchema,
  BenefitReducedFixedPriceSchema,
  BenefitDiscountSchema,
  BenefitOtherSchema,
]);

export type Benefit = z.infer<typeof BenefitSchema>;

export const LOCALIZED_METADATA_KEY = {
  CONDITION: "condition",
  DESCRIPTION: "description",
  NAME: "name",
} as const;

export const LANGUAGE = {
  DE: "de",
  EN: "en",
  FR: "fr",
  IT: "it",
  SL: "sl",
} as const;

const LocalizedMetadataSchema = z.object({
  id: z.ulid(),
  key: z.enum(LOCALIZED_METADATA_KEY),
  language: z.enum(LANGUAGE),
  value: z.string().min(1),
});

export const ACTOR_TYPE = {
  DEPARTMENT: "department",
  OPERATOR: "operator",
} as const;

export const OPPORTUNITY_STATUS = {
  DELETED: "deleted",
  DRAFT: "draft",
  PUBLISHED: "published",
  SUSPENDED: "suspended",
  TEST_PASSED: "test_passed",
  TEST_PENDING: "test_pending",
  TEST_REJECTED: "test_rejected",
} as const;

// Derived, response-only statuses: never persisted in the DB status column
// (see deriveOpportunityDisplayStatus below). Kept separate from
// OPPORTUNITY_STATUS since these are not valid values to write.
export const OPPORTUNITY_DISPLAY_STATUS = {
  SCHEDULED: "scheduled",
  SCHEDULED_SUSPENSION: "scheduled_suspension",
} as const;

export const OpportunitySchema = z.object({
  beneficiaryBenefit: BenefitSchema,
  caregiverBenefit: BenefitSchema.optional(),
  categoryId: z.ulid(),
  dateFrom: z.iso.date(),
  dateTo: z.iso.date().optional(),
  id: z.ulid(),
  localizedMetadata: z.array(LocalizedMetadataSchema).min(1),
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
  z.object({ type: z.literal(BENEFIT_TYPE.FREE) }),
  z.object({ type: z.literal(BENEFIT_TYPE.PRIORITY) }),
  z.object({
    type: z.literal(BENEFIT_TYPE.REDUCED_FIXED_PRICE),
    value: z.number().int(),
  }),
  z.object({
    discountType: z.enum(BENEFIT_DISCOUNT_TYPE),
    type: z.literal(BENEFIT_TYPE.DISCOUNT),
    value: z.number().int(),
  }),
  z.object({
    description: z.string().max(4096),
    type: z.literal(BENEFIT_TYPE.OTHER),
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
  suspendedBy: z.enum(ACTOR_TYPE).nullish(),
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
  if (status !== OPPORTUNITY_STATUS.PUBLISHED || !referenceDate) return status;
  if (dateFrom > referenceDate) return OPPORTUNITY_DISPLAY_STATUS.SCHEDULED;
  if (suspendFrom && suspendFrom > referenceDate)
    return OPPORTUNITY_DISPLAY_STATUS.SCHEDULED_SUSPENSION;
  return status;
};

const LocalizedMetadataSummarySchema = z.object({
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
  localizedMetadata: z.array(LocalizedMetadataSummarySchema),
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
  suspendedBy: z.enum(ACTOR_TYPE).nullish(),
  suspendFrom: z.string().nullish(),
  suspensionMessage: z.string().max(4096).nullish(),
  updatedAt: z.string(),
  url: z.url().max(2048).nullable(),
});

export type OpportunityDetail = z.infer<typeof OpportunityDetailSchema>;

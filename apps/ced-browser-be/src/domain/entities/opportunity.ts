import { z } from "zod";

export const OpportunityBenefitSchema = z.object({
  discountType: z.enum(["percentage", "fixed_amount"]).nullable(),
  type: z.enum([
    "free",
    "reduced_fixed_price",
    "priority",
    "discount",
    "other",
  ]),
  value: z.number().int().nullable(),
});

export type OpportunityBenefit = z.infer<typeof OpportunityBenefitSchema>;

export const OpportunityPlaceSchema = z.object({
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  id: z.string().min(1),
  name: z.string().min(1),
  postalCode: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  type: z.enum(["online", "offline"]),
  url: z.url().nullable().optional(),
});

export type OpportunityPlace = z.infer<typeof OpportunityPlaceSchema>;

export const OpportunityProfilePlaceAddressSchema = z.object({
  city: z.string(),
  postalCode: z.string(),
  state: z.string(),
  street: z.string(),
});

export type OpportunityProfilePlaceAddress = z.infer<
  typeof OpportunityProfilePlaceAddressSchema
>;

export const OpportunityProfilePlaceSchema = z.object({
  address: OpportunityProfilePlaceAddressSchema.nullable(),
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["online", "offline"]),
  website: z.url().nullable().optional(),
});

export type OpportunityProfilePlace = z.infer<
  typeof OpportunityProfilePlaceSchema
>;

export const OpportunityProfileSchema = z.object({
  displayName: z.string().min(1),
  id: z.string().min(1),
  place: OpportunityProfilePlaceSchema,
});

export type OpportunityProfile = z.infer<typeof OpportunityProfileSchema>;

export const OpportunityDetailSchema = z.object({
  beneficiaryBenefit: OpportunityBenefitSchema,
  caregiverBenefit: OpportunityBenefitSchema.nullable().optional(),
  category: z.string().min(1),
  condition: z.string().nullable().optional(),
  dateFrom: z.iso.date(),
  dateTo: z.iso.date().nullable().optional(),
  description: z.string().min(1),
  id: z.ulid(),
  language: z.enum(["en", "fr", "de", "sl", "it"]),
  name: z.string().min(1),
  nationalTerritory: z.boolean(),
  places: z.array(OpportunityPlaceSchema).min(1),
  profile: OpportunityProfileSchema,
  url: z.url().nullable().optional(),
});

export type OpportunityDetail = z.infer<typeof OpportunityDetailSchema>;

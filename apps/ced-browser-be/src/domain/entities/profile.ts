import { z } from "zod";

import { OpportunityBenefitSchema } from "./opportunity.js";

export const ProfileSupportContactSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1).max(2048),
});

export type ProfileSupportContact = z.infer<typeof ProfileSupportContactSchema>;

export const ProfileAddressSchema = z.object({
  city: z.string().min(1),
  postalCode: z.string().min(1),
  state: z.string().min(1),
  street: z.string().min(1),
});

export type ProfileAddress = z.infer<typeof ProfileAddressSchema>;

export const ProfilePlaceSchema = z.object({
  address: ProfileAddressSchema.nullable(),
  id: z.string().min(1),
  name: z.string().min(1),
  supportContacts: z.array(ProfileSupportContactSchema),
  type: z.enum(["online", "offline"]),
  website: z.url().nullable().optional(),
});

export type ProfilePlace = z.infer<typeof ProfilePlaceSchema>;

export const ProfileRecentPlaceSchema = z.object({
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

export type ProfileRecentPlace = z.infer<typeof ProfileRecentPlaceSchema>;

export const ProfileRecentOpportunitySchema = z.object({
  beneficiaryBenefit: OpportunityBenefitSchema,
  dateFrom: z.iso.date(),
  dateTo: z.iso.date().nullable().optional(),
  id: z.string().min(1),
  name: z.string().min(1),
});

export type ProfileRecentOpportunity = z.infer<
  typeof ProfileRecentOpportunitySchema
>;

export const OperatorProfileDetailSchema = z.object({
  displayName: z.string().min(1),
  place: ProfilePlaceSchema,
  recentOpportunities: z.array(ProfileRecentOpportunitySchema),
  recentPlaces: z.array(ProfileRecentPlaceSchema),
});

export type OperatorProfileDetail = z.infer<typeof OperatorProfileDetailSchema>;

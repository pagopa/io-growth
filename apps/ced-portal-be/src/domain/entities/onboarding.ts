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

export const OnboardingDetailGeographicTaxonomySchema = z.object({
  code: z.string().optional(),
  desc: z.string().optional(),
});

export const OnboardingDetailPaymentServiceProviderSchema = z.object({
  abiCode: z.string().optional(),
  businessRegisterNumber: z.string().optional(),
  contractId: z.string().optional(),
  contractType: z.string().optional(),
  legalRegisterName: z.string().optional(),
  legalRegisterNumber: z.string().optional(),
  longTermPayments: z.boolean().optional(),
  providerNames: z.array(z.string()).optional(),
  vatNumberGroup: z.boolean().optional(),
});

export const OnboardingDetailDataProtectionOfficerSchema = z.object({
  address: z.string().optional(),
  email: z.string().optional(),
  pec: z.string().optional(),
});

export const OnboardingDetailInstitutionSchema = z.object({
  address: z.string().optional(),
  atecoCodes: z.array(z.string()).optional(),
  businessRegisterPlace: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  county: z.string().optional(),
  dataProtectionOfficer: OnboardingDetailDataProtectionOfficerSchema.optional(),
  description: z.string().optional(),
  digitalAddress: z.string().optional(),
  geographicTaxonomies: z
    .array(OnboardingDetailGeographicTaxonomySchema)
    .optional(),
  id: z.string().optional(),
  institutionType: z.string().optional(),
  legalForm: z.string().optional(),
  origin: z.string().optional(),
  originId: z.string().optional(),
  parentDescription: z.string().optional(),
  paymentServiceProvider:
    OnboardingDetailPaymentServiceProviderSchema.optional(),
  rea: z.string().optional(),
  shareCapital: z.string().optional(),
  subunitCode: z.string().optional(),
  subunitType: z.string().optional(),
  supportEmail: z.string().optional(),
  supportPhone: z.string().optional(),
  taxCode: z.string().optional(),
  taxCodeInvoicing: z.string().optional(),
  zipCode: z.string().optional(),
});

export const OnboardingDetailUserSchema = z.object({
  email: z.string().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  productRole: z.string().optional(),
  role: z.string().optional(),
  surname: z.string().optional(),
  taxCode: z.string().optional(),
});

export const OnboardingDetailBillingSchema = z.object({
  publicServices: z.boolean().optional(),
  recipientCode: z.string().optional(),
  vatNumber: z.string().optional(),
});

export const OnboardingDetailPaymentSchema = z.object({
  holder: z.string().optional(),
  iban: z.string().optional(),
});

export const OnboardingDetailAdditionalInformationsSchema = z.object({
  agentOfPublicService: z.boolean().optional(),
  agentOfPublicServiceNote: z.string().optional(),
  belongRegulatedMarket: z.boolean().optional(),
  establishedByRegulatoryProvision: z.boolean().optional(),
  establishedByRegulatoryProvisionNote: z.string().optional(),
  ipa: z.boolean().optional(),
  ipaCode: z.string().optional(),
  otherNote: z.string().optional(),
  regulatedMarketNote: z.string().optional(),
});

export const OnboardingDetailUserRequesterSchema = z.object({
  userMailUuid: z.string().optional(),
  userRequestUid: z.string().optional(),
});

export const OnboardingSchema = z.object({
  city: z.string().optional(),
  county: z.string().optional(),
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

export const OnboardingDetailSchema = z.object({
  activatedAt: z.string().optional(),
  additionalInformations:
    OnboardingDetailAdditionalInformationsSchema.optional(),
  attachments: z.array(z.string()).optional(),
  billing: OnboardingDetailBillingSchema.optional(),
  createdAt: z.string().optional(),
  expiringDate: z.string().optional(),
  id: z.string().optional(),
  institution: OnboardingDetailInstitutionSchema.optional(),
  payment: OnboardingDetailPaymentSchema.optional(),
  pricingPlan: z.string().optional(),
  productId: z.string().optional(),
  reasonForReject: z.string().optional(),
  signContract: z.boolean().optional(),
  status: z.string().optional(),
  updatedAt: z.string().optional(),
  userRequester: OnboardingDetailUserRequesterSchema.optional(),
  users: z.array(OnboardingDetailUserSchema).optional(),
  workflowType: z.string().optional(),
});

export type OnboardingDetail = z.infer<typeof OnboardingDetailSchema>;

export const PaginatedOnboardingsSchema = z.object({
  count: z.number(),
  items: z.array(OnboardingSchema),
});

export type PaginatedOnboardings = z.infer<typeof PaginatedOnboardingsSchema>;

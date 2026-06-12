import type {
  DocumentContentRepository,
  InstitutionRepository,
  OnboardingRepository,
} from "@pagopa/io-core-adapter-ar";

import { vi } from "vitest";

import type { OnboardingDetail } from "../../../../domain/entities/onboarding.js";

export const MOCK_ONBOARDING_ID = "onb-1";
export const MOCK_MISSING_ONBOARDING_ID = "missing-onboarding";
export const MOCK_PRODUCT_ID = "prod-io-ced";

export const mockArSearchOnboardingsResponse = {
  onboardings: [
    {
      description: "Comune di Roma",
      onboardingId: MOCK_ONBOARDING_ID,
      productId: MOCK_PRODUCT_ID,
      status: "PENDING",
      taxCode: "12345678901",
    },
  ],
  totalElements: 1,
};

export const mockArOnboardingDetailItem = {
  activatedAt: "2026-06-10T12:00:00Z",
  additionalInformations: {
    agentOfPublicService: true,
    ipaCode: "IPA123",
  },
  attachments: ["contract.pdf"],
  billing: {
    publicServices: true,
    recipientCode: "ABC1234",
    vatNumber: "12345678901",
  },
  createdAt: "2026-06-01T12:00:00Z",
  id: MOCK_ONBOARDING_ID,
  institution: {
    city: "Roma",
    dataProtectionOfficer: {
      email: "dpo@example.org",
    },
    description: "Comune di Roma",
    geographicTaxonomies: [
      {
        code: "GT1",
        desc: "Taxonomy",
      },
    ],
    id: "inst-1",
    paymentServiceProvider: {
      abiCode: "03069",
      providerNames: ["Provider One"],
    },
    taxCode: "12345678901",
  },
  payment: {
    holder: "Comune di Roma",
    iban: "IT60X0542811101000000123456",
  },
  pricingPlan: "BASIC",
  productId: MOCK_PRODUCT_ID,
  reasonForReject: "missing docs",
  signContract: true,
  status: "COMPLETED",
  updatedAt: "2026-06-11T12:00:00Z",
  userRequester: {
    userMailUuid: "mail-1",
    userRequestUid: "user-1",
  },
  users: [
    {
      email: "operator@example.org",
      id: "user-2",
      name: "Mario",
      productRole: "admin",
      role: "MANAGER",
      surname: "Rossi",
      taxCode: "RSSMRA80A01H501U",
    },
  ],
  workflowType: "ONBOARDING",
};

export const mockOnboardingDetail: OnboardingDetail = {
  activatedAt: "2026-06-10T12:00:00Z",
  additionalInformations: {
    agentOfPublicService: true,
    agentOfPublicServiceNote: undefined,
    belongRegulatedMarket: undefined,
    establishedByRegulatoryProvision: undefined,
    establishedByRegulatoryProvisionNote: undefined,
    ipa: undefined,
    ipaCode: "IPA123",
    otherNote: undefined,
    regulatedMarketNote: undefined,
  },
  attachments: ["contract.pdf"],
  billing: {
    publicServices: true,
    recipientCode: "ABC1234",
    vatNumber: "12345678901",
  },
  createdAt: "2026-06-01T12:00:00Z",
  expiringDate: undefined,
  id: MOCK_ONBOARDING_ID,
  institution: {
    address: undefined,
    atecoCodes: undefined,
    businessRegisterPlace: undefined,
    city: "Roma",
    country: undefined,
    county: undefined,
    dataProtectionOfficer: {
      address: undefined,
      email: "dpo@example.org",
      pec: undefined,
    },
    description: "Comune di Roma",
    digitalAddress: undefined,
    geographicTaxonomies: [
      {
        code: "GT1",
        desc: "Taxonomy",
      },
    ],
    id: "inst-1",
    institutionType: undefined,
    legalForm: undefined,
    origin: undefined,
    originId: undefined,
    parentDescription: undefined,
    paymentServiceProvider: {
      abiCode: "03069",
      businessRegisterNumber: undefined,
      contractId: undefined,
      contractType: undefined,
      legalRegisterName: undefined,
      legalRegisterNumber: undefined,
      longTermPayments: undefined,
      providerNames: ["Provider One"],
      vatNumberGroup: undefined,
    },
    rea: undefined,
    shareCapital: undefined,
    subunitCode: undefined,
    subunitType: undefined,
    supportEmail: undefined,
    supportPhone: undefined,
    taxCode: "12345678901",
    taxCodeInvoicing: undefined,
    zipCode: undefined,
  },
  payment: {
    holder: "Comune di Roma",
    iban: "IT60X0542811101000000123456",
  },
  pricingPlan: "BASIC",
  productId: MOCK_PRODUCT_ID,
  reasonForReject: "missing docs",
  signContract: true,
  status: "COMPLETED",
  updatedAt: "2026-06-11T12:00:00Z",
  userRequester: {
    userMailUuid: "mail-1",
    userRequestUid: "user-1",
  },
  users: [
    {
      email: "operator@example.org",
      id: "user-2",
      name: "Mario",
      productRole: "admin",
      role: "MANAGER",
      surname: "Rossi",
      taxCode: "RSSMRA80A01H501U",
    },
  ],
  workflowType: "ONBOARDING",
};

export const createMockInstitutionRepository = (
  overrides: Partial<InstitutionRepository> = {},
): InstitutionRepository =>
  ({
    searchOnboardings: overrides.searchOnboardings ?? vi.fn(),
  }) as InstitutionRepository;

export const createMockOnboardingRepository = (
  overrides: Partial<OnboardingRepository> = {},
): OnboardingRepository =>
  ({
    completeOnboarding: overrides.completeOnboarding ?? vi.fn(),
    getOnboardingWithFilter: overrides.getOnboardingWithFilter ?? vi.fn(),
  }) as OnboardingRepository;

export const createMockDocumentContentRepository = (
  overrides: Partial<DocumentContentRepository> = {},
): DocumentContentRepository =>
  ({
    getContractSigned: overrides.getContractSigned ?? vi.fn(),
  }) as DocumentContentRepository;

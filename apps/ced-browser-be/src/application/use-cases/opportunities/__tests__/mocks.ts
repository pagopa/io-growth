import { ok } from "neverthrow";
import { vi } from "vitest";

import type {
  OpportunityRepository,
  OpportunitySearchItem,
  SearchOpportunitiesResult,
} from "../../../../domain/ports/outbound/persistence/opportunity.repository.js";

export const mockOpportunityDiscount: OpportunitySearchItem = {
  beneficiaryBenefitDiscountType: "percentage",
  beneficiaryBenefitType: "discount",
  beneficiaryBenefitValue: 20,
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  id: "01JVMK3N8XQZP5T6G2WYHAB4CD",
  language: "it",
  name: "Sconto mensile palestra",
  profileDisplayName: "Palestra FitLife Roma Centro",
};

export const mockOpportunityFree: OpportunitySearchItem = {
  beneficiaryBenefitDiscountType: null,
  beneficiaryBenefitType: "free",
  beneficiaryBenefitValue: null,
  dateFrom: "2026-02-01",
  id: "01JVMK3N8XQZP5T6G2WYHAB4CE",
  name: "Ingresso gratuito museo",
  profileDisplayName: "Museo Civico",
};

export const mockSearchOpportunitiesResult: SearchOpportunitiesResult = {
  items: [mockOpportunityDiscount, mockOpportunityFree],
  total: 2,
};

export const createMockOpportunityRepository = (
  overrides?: Partial<OpportunityRepository>,
): OpportunityRepository => ({
  findPublishedById: vi.fn().mockResolvedValue(ok(undefined)),
  searchFromMaterializedView: vi.fn().mockResolvedValue(ok(undefined)),
  ...overrides,
});

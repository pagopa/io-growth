import { vi } from "vitest";

import type { OpportunityRepository } from "../../../../domain/ports/outbound/persistence/opportunity.repository.js";

export const MOCK_OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";
export const MOCK_PLACE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CE";

export const mockCreateOpportunityInput = {
  beneficiaryBenefit: {
    discountType: "percentage" as const,
    type: "discount" as const,
    value: 20,
  },
  caregiverBenefit: {
    type: "free" as const,
  },
  categoryId: "01KRJXEYD44B58700GT982CCYY",
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  localizedMetadata: [
    {
      key: "name" as const,
      language: "it" as const,
      value: "Sconto 20%",
    },
    {
      key: "description" as const,
      language: "it" as const,
      value: "Sconto del 20% su tutti i servizi",
    },
  ],
  nationalTerritory: false,
  operatorId: MOCK_OPERATOR_ID,
  placeIds: [MOCK_PLACE_ID],
  url: "https://example.org/promo",
};

export const mockOpportunityDetail = {
  beneficiaryBenefit: {
    discountType: "percentage" as const,
    type: "discount" as const,
    value: 20,
  },
  caregiverBenefit: {
    type: "free" as const,
  },
  categoryId: mockCreateOpportunityInput.categoryId,
  categoryTitle: "title",
  createdAt: "2026-01-01T00:00:00.000Z",
  dateFrom: mockCreateOpportunityInput.dateFrom,
  dateTo: mockCreateOpportunityInput.dateTo,
  id: "01KRJXEYD44B58700GT982CCYZ",
  localizedMetadata: mockCreateOpportunityInput.localizedMetadata,
  nationalTerritory: false,
  placeIds: mockCreateOpportunityInput.placeIds,
  status: "draft" as const,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: mockCreateOpportunityInput.url,
};

export const createMockOpportunityRepository = (
  overrides?: Partial<OpportunityRepository>,
): OpportunityRepository => ({
  create: vi.fn(),
  getById: vi.fn(),
  list: vi.fn(),
  updateStatus: vi.fn(),
  ...overrides,
});

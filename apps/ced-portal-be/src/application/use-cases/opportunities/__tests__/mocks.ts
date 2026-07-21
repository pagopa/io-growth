import { ok } from "neverthrow";
import { vi } from "vitest";

import type { Profile } from "../../../../domain/entities/profile.js";
import type { MaterializedViewRepository } from "../../../../domain/ports/outbound/materialized-view.repository.js";
import type { OpportunityRepository } from "../../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { ProfileRepository } from "../../../../domain/ports/outbound/persistence/profile.repository.js";

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

export const mockProfile: Profile = {
  displayName: "Operatore Demo",
  operatorId: MOCK_OPERATOR_ID,
  place: {
    id: MOCK_PLACE_ID,
    name: "Sportello remoto",
    supportContacts: [],
    type: "online",
    website: { url: "https://example.org" },
  },
};

export const createMockProfileRepository = (
  overrides: Partial<ProfileRepository> = {},
): ProfileRepository => ({
  create: overrides.create ?? vi.fn(),
  getByOperatorId:
    overrides.getByOperatorId ?? vi.fn().mockResolvedValue(ok(mockProfile)),
});

export const createMockMaterializedViewRepository = (
  overrides: Partial<MaterializedViewRepository> = {},
): MaterializedViewRepository => ({
  refreshAll: overrides.refreshAll ?? vi.fn().mockResolvedValue(ok(undefined)),
});

export const createMockOpportunityRepository = (
  overrides: Partial<OpportunityRepository> = {},
): OpportunityRepository => ({
  cancelScheduledSuspensionById:
    overrides.cancelScheduledSuspensionById ?? vi.fn(),
  cancelScheduledSuspensionByIdAndOperatorId:
    overrides.cancelScheduledSuspensionByIdAndOperatorId ?? vi.fn(),
  countByExternalOperatorIds: overrides.countByExternalOperatorIds ?? vi.fn(),
  create: overrides.create ?? vi.fn(),
  deleteByIdAndOperatorId: overrides.deleteByIdAndOperatorId ?? vi.fn(),
  findAll: overrides.findAll ?? vi.fn(),
  findById: overrides.findById ?? vi.fn(),
  findByIdAndOperatorId: overrides.findByIdAndOperatorId ?? vi.fn(),
  suspendById: overrides.suspendById ?? vi.fn(),
  suspendByIdAndOperatorId: overrides.suspendByIdAndOperatorId ?? vi.fn(),
  updateStatusById: overrides.updateStatusById ?? vi.fn(),
  updateStatusByIdAndOperatorId:
    overrides.updateStatusByIdAndOperatorId ?? vi.fn(),
});

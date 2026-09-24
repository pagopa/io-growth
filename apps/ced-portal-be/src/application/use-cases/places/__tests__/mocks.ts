import { ok } from "neverthrow";
import { vi } from "vitest";

import type { MaterializedViewRepository } from "../../../../domain/ports/outbound/materialized-view.repository.js";
import type { OpportunityRepository } from "../../../../domain/ports/outbound/persistence/opportunity.repository.js";
import type { PlaceRepository } from "../../../../domain/ports/outbound/persistence/place.repository.js";

export const MOCK_OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";
export const MOCK_PLACE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CE";
export const MOCK_SUPPORT_CONTACT_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

export const mockPlace = {
  id: MOCK_PLACE_ID,
  name: "Sportello remoto",
  supportContacts: [
    {
      id: MOCK_SUPPORT_CONTACT_ID,
      type: "email" as const,
      value: "support@example.org",
    },
  ],
  type: "online" as const,
  website: {
    url: "https://example.org",
  },
};

export const mockPlaces = [mockPlace];

export const mockCreatePlaceInput = {
  operatorId: MOCK_OPERATOR_ID,
  place: {
    name: "Sportello remoto",
    supportContacts: [{ type: "email" as const, value: "support@example.org" }],
    type: "online" as const,
    website: {
      url: "https://example.org",
    },
  },
};

export const createMockPlaceRepository = (
  overrides?: Partial<PlaceRepository>,
): PlaceRepository => ({
  create: vi.fn(),
  deleteByIdAndOperatorId: vi.fn(),
  getById: vi.fn(),
  getIdsByOperator: vi.fn(),
  listByOperatorId: vi.fn(),
  ...overrides,
});

export const createMockOpportunityRepository = (
  overrides?: Partial<OpportunityRepository>,
): OpportunityRepository => ({
  cancelScheduledSuspensionById: vi.fn(),
  cancelScheduledSuspensionByIdAndOperatorId: vi.fn(),
  countByExternalOperatorIds: vi.fn(),
  create: vi.fn(),
  deleteByIdAndOperatorId: vi.fn(),
  existsWithSolePlaceByPlaceIdAndStatuses: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findByIdAndOperatorId: vi.fn(),
  suspendById: vi.fn(),
  suspendByIdAndOperatorId: vi.fn(),
  updateByIdAndOperatorId: vi.fn(),
  updateStatusById: vi.fn(),
  updateStatusByIdAndOperatorId: vi.fn(),
  ...overrides,
});

export const createMockMaterializedViewRepository = (
  overrides?: Partial<MaterializedViewRepository>,
): MaterializedViewRepository => ({
  refreshAll: vi.fn().mockResolvedValue(ok(undefined)),
  ...overrides,
});

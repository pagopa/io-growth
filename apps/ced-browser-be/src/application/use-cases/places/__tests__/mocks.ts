import { vi } from "vitest";

import type { PlaceRepository } from "../../../../domain/ports/outbound/persistence/place.repository.js";

export const MOCK_OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";

export const mockAccessPointOffline = {
  address: {
    city: "Alessandria",
    postalCode: "15121",
    state: "AL",
    street: "Piazza della Libertà 1",
  },
  entityId: MOCK_OPERATOR_ID,
  id: "01JVMK3N8XQZP5T6G2WYHAB4CE",
  name: "Comune di Alessandria",
  type: "profile" as const,
};

export const mockAccessPointOnline = {
  address: null,
  entityId: MOCK_OPERATOR_ID,
  id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
  name: "Flixbus",
  type: "place" as const,
  url: "https://flixbus.it",
};

export const mockAccessPoints = [mockAccessPointOffline, mockAccessPointOnline];

export const createMockPlaceRepository = (
  overrides?: Partial<PlaceRepository>,
): PlaceRepository => ({
  findAllByFullText: vi.fn(),
  findById: vi.fn(),
  ...overrides,
});

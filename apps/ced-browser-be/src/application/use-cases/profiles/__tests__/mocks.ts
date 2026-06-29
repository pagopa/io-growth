import { ok } from "neverthrow";
import { vi } from "vitest";

import type { OperatorProfileDetail } from "../../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../../domain/ports/outbound/persistence/profile.repository.js";

export const MOCK_PROFILE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";

export const mockOperatorProfileDetail: OperatorProfileDetail = {
  displayName: "Comune di Alessandria",
  place: {
    address: {
      city: "Alessandria",
      postalCode: "15121",
      state: "AL",
      street: "Piazza della Liberta 1",
    },
    id: "01JVMK3N8XQZP5T6G2WYHAB4CE",
    name: "Sportello Carta Europea della Disabilita",
    supportContacts: [
      {
        id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
        type: "phone",
        value: "+39 0131 515111",
      },
    ],
    type: "offline",
    website: null,
  },
  recentOpportunities: [
    {
      beneficiaryBenefit: {
        discountType: "percentage",
        type: "discount",
        value: 20,
      },
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
      id: "01JVMK3N8XQZP5T6G2WYHAB4CG",
      name: "Sconto mensile palestra",
    },
  ],
  recentPlaces: [
    {
      city: "Alessandria",
      country: "IT",
      id: "01JVMK3N8XQZP5T6G2WYHAB4CH",
      name: "Biblioteca civica Francesca Calvo",
      postalCode: "15121",
      state: "AL",
      street: "Piazza Vittorio Veneto 1",
      type: "offline",
      url: null,
    },
  ],
};

export const createMockProfileRepository = (
  overrides?: Partial<ProfileRepository>,
): ProfileRepository => ({
  getById: vi.fn().mockResolvedValue(ok(undefined)),
  ...overrides,
});

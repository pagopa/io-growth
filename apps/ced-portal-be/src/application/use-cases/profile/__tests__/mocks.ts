import { vi } from "vitest";

import type { ProfileRepository } from "../../../../domain/ports/outbound/persistence/profile.repository.js";

export const MOCK_OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";
export const MOCK_PLACE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CE";
export const MOCK_SUPPORT_CONTACT_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

export const mockProfile = {
  displayName: "Operatore Demo",
  operatorId: MOCK_OPERATOR_ID,
  place: {
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
  },
};

export const mockCreateProfileInput = {
  displayName: "Operatore Demo",
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

export const createMockProfileRepository = (
  overrides?: Partial<ProfileRepository>,
): ProfileRepository => ({
  create: vi.fn(),
  getByOperatorId: vi.fn(),
  ...overrides,
});

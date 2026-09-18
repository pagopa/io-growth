import { ok } from "neverthrow";
import { vi } from "vitest";

import type { ProfileRepository } from "../../../../domain/ports/outbound/persistence/profile.repository.js";
import type { ProfileAssetsRepository } from "../../../../domain/ports/outbound/profile-assets.repository.js";

export const MOCK_OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";
export const MOCK_PLACE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CE";
export const MOCK_SUPPORT_CONTACT_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

const createPng = () => new Blob([ONE_PIXEL_PNG], { type: "image/png" });

export const mockProfile = {
  contactEmail: "contatto@example.org",
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
  contactEmail: "contatto@example.org",
  displayName: "Operatore Demo",
  image: createPng(),
  logo: createPng(),
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

export const createMockProfileAssetsRepository = (
  overrides?: Partial<ProfileAssetsRepository>,
): ProfileAssetsRepository => ({
  uploadProfileAssets: vi.fn().mockResolvedValue(ok(undefined)),
  ...overrides,
});

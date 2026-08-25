import { ok } from "neverthrow";
import { vi } from "vitest";

import type { SupportRecord } from "../../../../domain/entities/support-record.js";
import type { SupportRecordRepository } from "../../../../domain/ports/outbound/persistence/support-record.repository.js";

export const MOCK_FISCAL_CODE = "RSSMRA80A01H501U";
export const MOCK_ID_LAVORAZIONE = "ABC-12345";

export const mockUploadPhotoInput = {
  clientRequestId: "9b1c1a2f-8f3a-4c1a-9c1a-000000000002",
  codiceFiscale: MOCK_FISCAL_CODE,
  fotoCED: "ZmFrZS1waG90by1ieXRlcw==",
  idLavorazione: MOCK_ID_LAVORAZIONE,
  informativaFoto: true,
};

export const baseSupportRecord = (
  overrides?: Partial<SupportRecord>,
): SupportRecord => ({
  codiceFiscale: MOCK_FISCAL_CODE,
  createdAt: "2026-01-01T00:00:00.000Z",
  idLavorazione: MOCK_ID_LAVORAZIONE,
  lastReconciliation: null,
  pendingStep: null,
  previousIdLavorazione: null,
  schemaVersion: 2,
  state: "READY_FOR_PHOTO_UPLOAD",
  steps: { confirm: null, draft: null, photo: null },
  ttl: 2592000,
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

export const createMockSupportRecordRepository = (
  overrides?: Partial<SupportRecordRepository>,
): SupportRecordRepository => ({
  getByCodiceFiscale: vi.fn().mockResolvedValue(ok(undefined)),
  // By default, persist succeeds and echoes back the given record.
  save: vi.fn().mockImplementation((record) => Promise.resolve(ok(record))),
  ...overrides,
});

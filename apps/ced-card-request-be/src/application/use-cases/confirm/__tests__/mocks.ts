import { ok } from "neverthrow";
import { vi } from "vitest";

import type { SupportRecord } from "../../../../domain/entities/support-record.js";
import type { SupportRecordRepository } from "../../../../domain/ports/outbound/persistence/support-record.repository.js";

export const MOCK_FISCAL_CODE = "RSSMRA80A01H501U";
export const MOCK_ID_LAVORAZIONE = "ABC-12345";

export const mockConfirmApplicationInput = {
  allegato: null,
  autodichiarazioneSentenza: null,
  clientRequestId: "1f2e3d4c-8f3a-4c1a-9c1a-000000000003",
  codiceFiscale: MOCK_FISCAL_CODE,
  dataSentenza: null,
  descrizioneComuneTribunale: null,
  dichiarazioneConformitaVerbale: null,
  dirittoAccompagnatore: null,
  idLavorazione: MOCK_ID_LAVORAZIONE,
  nomeFile: null,
  siglaProvinciaTribunale: null,
  tipologiaUlterioreDocumentazione: null,
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
  state: "READY_FOR_DOCUMENTS_UPLOAD",
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

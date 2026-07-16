import { ok } from "neverthrow";
import { vi } from "vitest";

import type { SupportRecordRepository } from "../../../../domain/ports/outbound/persistence/support-record.repository.js";

export const MOCK_FISCAL_CODE = "RSSMRA80A01H501U";

export const mockCreateDraftInput = {
  capRec: "00100",
  civicoRec: "12",
  clientRequestId: "5e0bb1a2-8f3a-4c1a-9c1a-000000000001",
  codiceFiscale: MOCK_FISCAL_CODE,
  cognome: "Rossi",
  comuneNascita: "Roma",
  dataNascita: "1980-01-01T00:00:00.000Z",
  dataScadenzaPermessoSoggiorno: null,
  datiAggiuntiviRec: null,
  descrizioneComuneRec: "Roma",
  idCittadinanza: 0 as const,
  indirizzoRec: "Via Roma",
  informativaPrivacy: true,
  nome: "Mario",
  pressoCognome: null,
  pressoDenominazione: null,
  pressoNome: null,
  sesso: "M" as const,
  siglaProvinciaNascita: "RM",
  siglaProvinciaRec: "RM",
  statoNascita: "ITALIA",
};

export const createMockSupportRecordRepository = (
  overrides?: Partial<SupportRecordRepository>,
): SupportRecordRepository => ({
  getByCodiceFiscale: vi.fn().mockResolvedValue(ok(undefined)),
  // By default, persist succeeds and echoes back the given record.
  save: vi.fn().mockImplementation((record) => Promise.resolve(ok(record))),
  ...overrides,
});

import {
  GenericError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SupportRecord } from "../../../../domain/entities/support-record.js";

import {
  createMockGestioneDomandaCedRepository,
  createMockSupportRecordRepository,
} from "../../status/__tests__/mocks.js";
import { makeGetDraftDataUseCase } from "../get-draft-data.use-case.js";

const FISCAL_CODE = "RSSMRA80A01H501U";
const ID_LAVORAZIONE = "12345678901234567890";

const supportRecord = (overrides?: Partial<SupportRecord>): SupportRecord => ({
  codiceFiscale: FISCAL_CODE,
  createdAt: "2026-01-01T00:00:00.000Z",
  idLavorazione: ID_LAVORAZIONE,
  lastReconciliation: {
    at: "2026-01-01T00:00:00.000Z",
    esitoCheck: 20,
  },
  pendingStep: null,
  previousIdLavorazione: null,
  schemaVersion: 2,
  state: "READY_FOR_PHOTO_UPLOAD",
  steps: { confirm: null, draft: null, photo: null },
  ttl: 2592000,
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const recoveredData = {
  anagrafica: {
    codiceFiscale: FISCAL_CODE,
    cognome: "Rossi",
    comuneNascita: "Roma",
    dataNascita: "1980-01-01T00:00:00Z",
    dataScadenzaPermessoSoggiorno: null,
    idCittadinanza: 0 as const,
    nome: "Mario",
    sesso: "M",
    siglaProvinciaNascita: "RM",
    statoNascita: "ITALIA",
  },
  fotoCED: null,
  idLavorazione: ID_LAVORAZIONE,
  recapito: {
    cap: "00100",
    civico: "1",
    datiAggiuntivi: null,
    descrizioneComune: "Roma",
    indirizzo: "Via Roma",
    pressoCognome: null,
    pressoDenominazione: null,
    pressoNome: null,
    siglaProvincia: "RM",
  },
};

describe("makeGetDraftDataUseCase", () => {
  const inpsRepository = createMockGestioneDomandaCedRepository();
  const supportRecordRepository = createMockSupportRecordRepository();
  const useCase = makeGetDraftDataUseCase(
    supportRecordRepository,
    inpsRepository,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(supportRecord()),
    );
  });

  it.each([
    ["READY_FOR_PHOTO_UPLOAD", null],
    ["READY_FOR_DOCUMENTS_UPLOAD", "base64-photo"],
  ] as const)(
    "recovers draft data from reconciled state %s",
    async (state, fotoCED) => {
      vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
        ok(supportRecord({ state })),
      );
      vi.mocked(inpsRepository.recuperoDatiDomanda).mockResolvedValue(
        ok({ ...recoveredData, fotoCED }),
      );

      const result = await useCase({ fiscalCode: FISCAL_CODE });

      expect(inpsRepository.checkDomanda).not.toHaveBeenCalled();
      expect(inpsRepository.recuperoDatiDomanda).toHaveBeenCalledWith({
        codiceFiscale: FISCAL_CODE,
        idLavorazione: ID_LAVORAZIONE,
      });
      expect(result).toEqual(
        ok(
          expect.objectContaining({
            codiceFiscale: FISCAL_CODE,
            fotoCED,
            indirizzoRec: "Via Roma",
          }),
        ),
      );
    },
  );

  it("returns NotFoundError when GET /status has not created a support record", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(undefined),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(NotFoundError)));
    expect(inpsRepository.recuperoDatiDomanda).not.toHaveBeenCalled();
  });

  it("rejects a reconciled state without an active draft", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(supportRecord({ state: "ACQUIRED" })),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(ValidationError)));
    expect(inpsRepository.recuperoDatiDomanda).not.toHaveBeenCalled();
  });

  it("rejects an active draft record without idLavorazione", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(supportRecord({ idLavorazione: null })),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
    expect(inpsRepository.recuperoDatiDomanda).not.toHaveBeenCalled();
  });

  it("propagates a CosmosDB read error", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      err(new ServiceUnavailableError("Cosmos read failed")),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
  });

  it("propagates a recovery error", async () => {
    vi.mocked(inpsRepository.recuperoDatiDomanda).mockResolvedValue(
      err(new GenericError("INPS unavailable")),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
  });

  it("rejects an invalid response from INPS", async () => {
    vi.mocked(inpsRepository.recuperoDatiDomanda).mockResolvedValue(
      ok({
        ...recoveredData,
        anagrafica: { ...recoveredData.anagrafica, nome: null },
      }),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
  });
});

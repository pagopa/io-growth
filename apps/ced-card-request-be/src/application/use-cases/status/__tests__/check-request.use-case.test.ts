import { TipoEsitoCheck } from "@pagopa/io-core-adapter-inps-ced";
import {
  GenericError,
  ServiceUnavailableError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SupportRecord } from "../../../../domain/entities/support-record.js";

import { makeCheckRequestUseCase } from "../check-request.use-case.js";
import {
  createMockGestioneDomandaCedRepository,
  createMockSupportRecordRepository,
} from "./mocks.js";

const FISCAL_CODE = "RSSMRA80A01H501U";
const MOCK_ID_LAVORAZIONE = "12345678901234567890";

const baseRecord = (overrides?: Partial<SupportRecord>): SupportRecord => ({
  codiceFiscale: FISCAL_CODE,
  createdAt: "2026-01-01T00:00:00.000Z",
  idLavorazione: MOCK_ID_LAVORAZIONE,
  lastReconciliation: null,
  pendingStep: null,
  previousIdLavorazione: null,
  schemaVersion: 2,
  state: "ACQUIRED",
  steps: { confirm: null, draft: null, photo: null },
  ttl: 2592000,
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("makeCheckRequestUseCase", () => {
  const checkDomandaRepo = createMockGestioneDomandaCedRepository();
  const supportRecordRepo = createMockSupportRecordRepository();
  const useCase = makeCheckRequestUseCase(checkDomandaRepo, supportRecordRepo);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
      ok(undefined),
    );
  });

  it.each([
    [TipoEsitoCheck.NUMBER_10, "READY_FOR_NEW_DRAFT"],
    [TipoEsitoCheck.NUMBER_20, "READY_FOR_PHOTO_UPLOAD"],
    [TipoEsitoCheck.NUMBER_30, "READY_FOR_DOCUMENTS_UPLOAD"],
    [TipoEsitoCheck.NUMBER_50, "READY_FOR_NEW_DRAFT"],
  ] as const)(
    "maps esitoCheck %s to state %s without calling the support record repository",
    async (esitoCheck, expectedState) => {
      vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
        ok({ esitoCheck, idLavorazione: MOCK_ID_LAVORAZIONE }),
      );

      const result = await useCase({ fiscalCode: FISCAL_CODE });

      expect(checkDomandaRepo.checkDomanda).toHaveBeenCalledWith({
        codiceFiscale: FISCAL_CODE,
      });
      expect(result).toEqual(
        ok({ idLavorazione: MOCK_ID_LAVORAZIONE, state: expectedState }),
      );
      expect(supportRecordRepo.getByCodiceFiscale).not.toHaveBeenCalled();
    },
  );

  describe("ACQUIRED state", () => {
    it("returns numDomus from the support record when available", async () => {
      vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
        ok({
          esitoCheck: TipoEsitoCheck.NUMBER_40,
          idLavorazione: MOCK_ID_LAVORAZIONE,
        }),
      );
      vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
        ok(baseRecord({ numDomus: "DOMUS-001" })),
      );

      const result = await useCase({ fiscalCode: FISCAL_CODE });

      expect(result).toEqual(
        ok({
          idLavorazione: MOCK_ID_LAVORAZIONE,
          numDomus: "DOMUS-001",
          state: "ACQUIRED",
        }),
      );
      expect(supportRecordRepo.getByCodiceFiscale).toHaveBeenCalledWith(
        FISCAL_CODE,
      );
    });

    it("omits numDomus when no support record exists", async () => {
      vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
        ok({
          esitoCheck: TipoEsitoCheck.NUMBER_40,
          idLavorazione: MOCK_ID_LAVORAZIONE,
        }),
      );

      const result = await useCase({ fiscalCode: FISCAL_CODE });

      expect(result).toEqual(
        ok({ idLavorazione: MOCK_ID_LAVORAZIONE, state: "ACQUIRED" }),
      );
    });

    it("returns a ServiceUnavailableError when the support record read fails", async () => {
      vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
        ok({
          esitoCheck: TipoEsitoCheck.NUMBER_40,
          idLavorazione: MOCK_ID_LAVORAZIONE,
        }),
      );
      vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
        err(new ServiceUnavailableError("Cosmos read failed")),
      );

      const result = await useCase({ fiscalCode: FISCAL_CODE });

      expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
    });
  });

  it("returns a ValidationError for an invalid fiscal code", async () => {
    const result = await useCase({ fiscalCode: "short" });

    expect(checkDomandaRepo.checkDomanda).not.toHaveBeenCalled();
    expect(result).toEqual(err(expect.any(ValidationError)));
  });

  it("propagates the repository error", async () => {
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      err(new GenericError("INPS unavailable")),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
  });

  it("returns a GenericError when esitoCheck is missing", async () => {
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      ok({ idLavorazione: null }),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
  });
});

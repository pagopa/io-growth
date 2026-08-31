import {
  GenericError,
  ServiceUnavailableError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SupportRecord } from "../../../../domain/entities/support-record.js";

import { createMockCardApplicationRepository } from "../../__tests__/mocks.js";
import { makeCheckRequestUseCase } from "../check-request.use-case.js";
import { createMockSupportRecordRepository } from "./mocks.js";

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
  const cardApplicationRepository = createMockCardApplicationRepository();
  const supportRecordRepo = createMockSupportRecordRepository();
  const useCase = makeCheckRequestUseCase(
    cardApplicationRepository,
    supportRecordRepo,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
      ok(undefined),
    );
  });

  // The upstream esitoCheck → milestone translation is covered by the outbound
  // adapter's mapper tests; here the port already speaks the domain language.
  it.each([
    "READY_FOR_NEW_DRAFT",
    "READY_FOR_PHOTO_UPLOAD",
    "READY_FOR_DOCUMENTS_UPLOAD",
  ] as const)(
    "returns state %s without reading the support record",
    async (state) => {
      vi.mocked(
        cardApplicationRepository.checkApplicationState,
      ).mockResolvedValue(ok({ idLavorazione: MOCK_ID_LAVORAZIONE, state }));

      const result = await useCase({ fiscalCode: FISCAL_CODE });

      expect(
        cardApplicationRepository.checkApplicationState,
      ).toHaveBeenCalledWith(FISCAL_CODE);
      expect(result).toEqual(ok({ idLavorazione: MOCK_ID_LAVORAZIONE, state }));
      expect(supportRecordRepo.getByCodiceFiscale).not.toHaveBeenCalled();
    },
  );

  describe("ACQUIRED state", () => {
    it("returns numDomus from the support record when available", async () => {
      vi.mocked(
        cardApplicationRepository.checkApplicationState,
      ).mockResolvedValue(
        ok({ idLavorazione: MOCK_ID_LAVORAZIONE, state: "ACQUIRED" }),
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
      vi.mocked(
        cardApplicationRepository.checkApplicationState,
      ).mockResolvedValue(
        ok({ idLavorazione: MOCK_ID_LAVORAZIONE, state: "ACQUIRED" }),
      );

      const result = await useCase({ fiscalCode: FISCAL_CODE });

      expect(result).toEqual(
        ok({ idLavorazione: MOCK_ID_LAVORAZIONE, state: "ACQUIRED" }),
      );
    });

    it("returns a ServiceUnavailableError when the support record read fails", async () => {
      vi.mocked(
        cardApplicationRepository.checkApplicationState,
      ).mockResolvedValue(
        ok({ idLavorazione: MOCK_ID_LAVORAZIONE, state: "ACQUIRED" }),
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

    expect(
      cardApplicationRepository.checkApplicationState,
    ).not.toHaveBeenCalled();
    expect(result).toEqual(err(expect.any(ValidationError)));
  });

  it("propagates the repository error", async () => {
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(err(new GenericError("INPS unavailable")));

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
  });
});

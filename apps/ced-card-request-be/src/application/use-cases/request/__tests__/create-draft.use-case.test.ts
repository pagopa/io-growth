import {
  GenericError,
  ServiceUnavailableError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SupportRecord } from "../../../../domain/entities/support-record.js";

import { createMockCardApplicationRepository } from "../../__tests__/mocks.js";
import { makeCreateDraftUseCase } from "../create-draft.use-case.js";
import {
  createMockSupportRecordRepository,
  MOCK_FISCAL_CODE,
  mockCreateDraftInput,
} from "./mocks.js";

const baseRecord = (overrides?: Partial<SupportRecord>): SupportRecord => ({
  codiceFiscale: MOCK_FISCAL_CODE,
  createdAt: "2026-01-01T00:00:00.000Z",
  idLavorazione: null,
  lastReconciliation: null,
  pendingStep: null,
  previousIdLavorazione: null,
  schemaVersion: 2,
  state: "READY_FOR_NEW_DRAFT",
  steps: { confirm: null, draft: null, photo: null },
  ttl: 2592000,
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

// eslint-disable-next-line max-lines-per-function
describe("makeCreateDraftUseCase", () => {
  let supportRecordRepository: ReturnType<
    typeof createMockSupportRecordRepository
  >;
  let cardApplicationRepository: ReturnType<
    typeof createMockCardApplicationRepository
  >;

  beforeEach(() => {
    supportRecordRepository = createMockSupportRecordRepository();
    cardApplicationRepository = createMockCardApplicationRepository();
  });

  const useCase = () =>
    makeCreateDraftUseCase(supportRecordRepository, cardApplicationRepository);

  it("returns a ValidationError for invalid input without touching any repository", async () => {
    const result = await useCase()({
      ...mockCreateDraftInput,
      codiceFiscale: "short",
    });

    expect(result).toEqual(err(expect.any(ValidationError)));
    expect(supportRecordRepository.getByCodiceFiscale).not.toHaveBeenCalled();
    expect(
      cardApplicationRepository.createApplicationDraft,
    ).not.toHaveBeenCalled();
  });

  describe("replay, retry, and new intent", () => {
    it("replays a COMPLETED draft with the same client key without calling INPS", async () => {
      const existing = baseRecord({
        idLavorazione: "ABC-12345",
        state: "READY_FOR_PHOTO_UPLOAD",
        steps: {
          confirm: null,
          draft: {
            attempts: 1,
            clientRequestId: mockCreateDraftInput.clientRequestId,
            completedAt: "2026-01-01T00:00:02.000Z",
            inpsIdempotencyKey: "inps-key-1",
            lastErrorCode: null,
            status: "COMPLETED",
            submittedAt: "2026-01-01T00:00:00.000Z",
          },
          photo: null,
        },
      });
      vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
        ok(existing),
      );

      const result = await useCase()(mockCreateDraftInput);

      expect(result).toEqual(
        ok({ idLavorazione: "ABC-12345", state: "READY_FOR_PHOTO_UPLOAD" }),
      );
      expect(
        cardApplicationRepository.createApplicationDraft,
      ).not.toHaveBeenCalled();
      expect(supportRecordRepository.save).not.toHaveBeenCalled();
    });

    it("retries a PENDING draft by reusing the same INPS idempotency key", async () => {
      const existing = baseRecord({
        pendingStep: "DRAFT",
        steps: {
          confirm: null,
          draft: {
            attempts: 1,
            clientRequestId: mockCreateDraftInput.clientRequestId,
            completedAt: null,
            inpsIdempotencyKey: "inps-key-1",
            lastErrorCode: null,
            status: "PENDING",
            submittedAt: "2026-01-01T00:00:00.000Z",
          },
          photo: null,
        },
      });
      vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
        ok(existing),
      );
      vi.mocked(
        cardApplicationRepository.createApplicationDraft,
      ).mockResolvedValue(ok({ idLavorazione: "ABC-12345" }));

      const result = await useCase()(mockCreateDraftInput);

      expect(result).toEqual(
        ok({ idLavorazione: "ABC-12345", state: "READY_FOR_PHOTO_UPLOAD" }),
      );
      expect(
        cardApplicationRepository.createApplicationDraft,
      ).toHaveBeenCalledWith(
        {
          capRec: "00100",
          civicoRec: "12",
          codiceFiscale: MOCK_FISCAL_CODE,
          cognome: "Rossi",
          comuneNascita: "Roma",
          dataNascita: "1980-01-01T00:00:00.000Z",
          dataScadenzaPermessoSoggiorno: null,
          datiAggiuntiviRec: null,
          descrizioneComuneRec: "Roma",
          idCittadinanza: 0,
          indirizzoRec: "Via Roma",
          informativaPrivacy: true,
          nome: "Mario",
          pressoCognome: null,
          pressoDenominazione: null,
          pressoNome: null,
          sesso: "M",
          siglaProvinciaNascita: "RM",
          siglaProvinciaRec: "RM",
          statoNascita: "ITALIA",
        },
        {
          idempotencyKey: "inps-key-1",
        },
      );
    });

    it("starts a new intent with a fresh INPS key and cascades a reset of photo/confirm", async () => {
      const existing = baseRecord({
        idLavorazione: "OLD-99999",
        numDomus: "OLD-DOMUS",
        state: "READY_FOR_DOCUMENTS_UPLOAD",
        steps: {
          confirm: null,
          draft: {
            attempts: 1,
            clientRequestId: "previous-client-key",
            completedAt: "2026-01-01T00:00:02.000Z",
            inpsIdempotencyKey: "old-inps-key",
            lastErrorCode: null,
            status: "COMPLETED",
            submittedAt: "2026-01-01T00:00:00.000Z",
          },
          photo: {
            attempts: 1,
            clientRequestId: "previous-photo-key",
            completedAt: "2026-01-01T00:01:00.000Z",
            inpsIdempotencyKey: "old-photo-key",
            lastErrorCode: null,
            status: "COMPLETED",
            submittedAt: "2026-01-01T00:00:30.000Z",
          },
        },
      });
      vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
        ok(existing),
      );
      vi.mocked(
        cardApplicationRepository.createApplicationDraft,
      ).mockResolvedValue(ok({ idLavorazione: "NEW-11111" }));

      const result = await useCase()(mockCreateDraftInput);

      expect(result).toEqual(
        ok({ idLavorazione: "NEW-11111", state: "READY_FOR_PHOTO_UPLOAD" }),
      );
      // Write 1 (the intent) must clear idLavorazione and downstream steps.
      expect(supportRecordRepository.save).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          idLavorazione: null,
          numDomus: null,
          pendingStep: "DRAFT",
          steps: expect.objectContaining({ confirm: null, photo: null }),
        }),
      );
      const [, { idempotencyKey }] = vi.mocked(
        cardApplicationRepository.createApplicationDraft,
      ).mock.calls[0];
      expect(idempotencyKey).not.toBe("old-inps-key");
    });

    it("treats a missing support record as a new intent", async () => {
      vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
        ok(undefined),
      );
      vi.mocked(
        cardApplicationRepository.createApplicationDraft,
      ).mockResolvedValue(ok({ idLavorazione: "NEW-11111" }));

      const result = await useCase()(mockCreateDraftInput);

      expect(result).toEqual(
        ok({ idLavorazione: "NEW-11111", state: "READY_FOR_PHOTO_UPLOAD" }),
      );
    });
  });

  describe("INPS outcomes", () => {
    it("invalidates a previous reconciliation snapshot after INPS creates the draft", async () => {
      vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
        ok(
          baseRecord({
            lastReconciliation: {
              at: "2026-01-01T00:00:00.000Z",
              esitoCheck: 10,
            },
          }),
        ),
      );
      vi.mocked(
        cardApplicationRepository.createApplicationDraft,
      ).mockResolvedValue(ok({ idLavorazione: "NEW-11111" }));

      await useCase()(mockCreateDraftInput);

      expect(supportRecordRepository.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          lastReconciliation: null,
          state: "READY_FOR_PHOTO_UPLOAD",
        }),
      );
    });

    it("handles ValidationError by marking the step FAILED and system errors by leaving it PENDING", async () => {
      // 400 from INPS → step is marked FAILED.
      vi.mocked(
        cardApplicationRepository.createApplicationDraft,
      ).mockResolvedValueOnce(err(new ValidationError("draft rejected")));

      const validationResult = await useCase()(mockCreateDraftInput);

      expect(validationResult).toEqual(err(expect.any(ValidationError)));
      expect(supportRecordRepository.save).toHaveBeenCalledTimes(2);
      expect(supportRecordRepository.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          pendingStep: null,
          steps: expect.objectContaining({
            draft: expect.objectContaining({ status: "FAILED" }),
          }),
        }),
      );

      // INPS system error → step stays PENDING so a retry can reuse the key.
      vi.clearAllMocks();
      vi.mocked(
        cardApplicationRepository.createApplicationDraft,
      ).mockResolvedValueOnce(err(new GenericError("INPS unavailable")));

      const systemErrorResult = await useCase()(mockCreateDraftInput);

      expect(systemErrorResult).toEqual(err(expect.any(GenericError)));
      expect(supportRecordRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("persistence failures", () => {
    it("propagates a ServiceUnavailableError when reading the support record fails", async () => {
      vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
        err(new ServiceUnavailableError("Cosmos read failed")),
      );

      const result = await useCase()(mockCreateDraftInput);

      expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
      expect(
        cardApplicationRepository.createApplicationDraft,
      ).not.toHaveBeenCalled();
    });

    it("propagates a ServiceUnavailableError when saving the intent fails", async () => {
      vi.mocked(supportRecordRepository.save).mockResolvedValueOnce(
        err(new ServiceUnavailableError("Cosmos write failed")),
      );

      const result = await useCase()(mockCreateDraftInput);

      expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
      expect(
        cardApplicationRepository.createApplicationDraft,
      ).not.toHaveBeenCalled();
    });

    it("returns a GenericError when saving the outcome fails after INPS already succeeded", async () => {
      vi.mocked(
        cardApplicationRepository.createApplicationDraft,
      ).mockResolvedValue(ok({ idLavorazione: "NEW-11111" }));
      vi.mocked(supportRecordRepository.save)
        .mockImplementationOnce((record) => Promise.resolve(ok(record)))
        .mockResolvedValueOnce(
          err(new ServiceUnavailableError("Cosmos write failed")),
        );

      const result = await useCase()(mockCreateDraftInput);

      expect(result).toEqual(err(expect.any(GenericError)));
    });
  });
});

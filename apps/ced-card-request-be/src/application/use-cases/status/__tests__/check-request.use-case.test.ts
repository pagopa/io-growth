import { TipoEsitoCheck } from "@pagopa/io-core-adapter-inps-ced";
import {
  GenericError,
  ServiceUnavailableError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  StepInfo,
  SupportRecord,
} from "../../../../domain/entities/support-record.js";

import { makeCheckRequestUseCase } from "../check-request.use-case.js";
import {
  createMockGestioneDomandaCedRepository,
  createMockSupportRecordRepository,
} from "./mocks.js";

const FISCAL_CODE = "RSSMRA80A01H501U";
const MOCK_ID_LAVORAZIONE = "12345678901234567890";

const pendingStep = (clientRequestId: string): StepInfo => ({
  attempts: 1,
  clientRequestId,
  completedAt: null,
  inpsIdempotencyKey: "inps-key",
  lastErrorCode: null,
  status: "PENDING",
  submittedAt: "2026-01-01T00:00:00.000Z",
});

const baseRecord = (overrides?: Partial<SupportRecord>): SupportRecord => ({
  codiceFiscale: FISCAL_CODE,
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

describe("makeCheckRequestUseCase", () => {
  const checkDomandaRepo = createMockGestioneDomandaCedRepository();
  const supportRecordRepo = createMockSupportRecordRepository();
  const useCase = makeCheckRequestUseCase(checkDomandaRepo, supportRecordRepo);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
      ok(undefined),
    );
    vi.mocked(supportRecordRepo.save).mockImplementation((record) =>
      Promise.resolve(ok(record)),
    );
  });

  it("returns READY_FOR_NEW_DRAFT without creating a record when INPS has no application", async () => {
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      ok({ esitoCheck: TipoEsitoCheck.NUMBER_10, idLavorazione: null }),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(
      ok({ idLavorazione: null, state: "READY_FOR_NEW_DRAFT" }),
    );
    expect(supportRecordRepo.getByCodiceFiscale).toHaveBeenCalledWith(
      FISCAL_CODE,
    );
    expect(supportRecordRepo.save).not.toHaveBeenCalled();
  });

  it("recreates a missing support record from esitoCheck 20", async () => {
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      ok({
        esitoCheck: TipoEsitoCheck.NUMBER_20,
        idLavorazione: MOCK_ID_LAVORAZIONE,
      }),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_PHOTO_UPLOAD",
      }),
    );
    expect(supportRecordRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        codiceFiscale: FISCAL_CODE,
        idLavorazione: MOCK_ID_LAVORAZIONE,
        lastReconciliation: {
          at: expect.any(String),
          esitoCheck: TipoEsitoCheck.NUMBER_20,
        },
        state: "READY_FOR_PHOTO_UPLOAD",
      }),
    );
  });

  it("marks a pending photo as completed when INPS reports esitoCheck 30", async () => {
    const photo = pendingStep("photo-request");
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      ok({
        esitoCheck: TipoEsitoCheck.NUMBER_30,
        idLavorazione: MOCK_ID_LAVORAZIONE,
      }),
    );
    vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
      ok(
        baseRecord({
          pendingStep: "PHOTO",
          steps: { confirm: null, draft: null, photo },
        }),
      ),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_DOCUMENTS_UPLOAD",
      }),
    );
    expect(supportRecordRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        pendingStep: null,
        state: "READY_FOR_DOCUMENTS_UPLOAD",
        steps: {
          confirm: null,
          draft: null,
          photo: {
            ...photo,
            completedAt: expect.any(String),
            status: "COMPLETED",
          },
        },
      }),
    );
  });

  it("keeps an unreflected photo step retryable when INPS still reports esitoCheck 20", async () => {
    const photo = pendingStep("photo-request");
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      ok({
        esitoCheck: TipoEsitoCheck.NUMBER_20,
        idLavorazione: MOCK_ID_LAVORAZIONE,
      }),
    );
    vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
      ok(
        baseRecord({
          pendingStep: "PHOTO",
          steps: { confirm: null, draft: null, photo },
        }),
      ),
    );

    await useCase({ fiscalCode: FISCAL_CODE });

    expect(supportRecordRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        pendingStep: null,
        steps: { confirm: null, draft: null, photo },
      }),
    );
  });

  it("clears the active flow and preserves history for esitoCheck 50", async () => {
    const existing = baseRecord({
      numDomus: "OLD-DOMUS",
      pendingStep: "PHOTO",
      steps: {
        confirm: null,
        draft: pendingStep("draft-request"),
        photo: pendingStep("photo-request"),
      },
    });
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      ok({
        esitoCheck: TipoEsitoCheck.NUMBER_50,
        idLavorazione: MOCK_ID_LAVORAZIONE,
      }),
    );
    vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
      ok(existing),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_NEW_DRAFT",
      }),
    );
    expect(supportRecordRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        idLavorazione: null,
        numDomus: null,
        pendingStep: null,
        previousIdLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_NEW_DRAFT",
        steps: { confirm: null, draft: null, photo: null },
      }),
    );
  });

  it("returns numDomus from the reconciled ACQUIRED record", async () => {
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
  });
});

describe("makeCheckRequestUseCase error handling", () => {
  const checkDomandaRepo = createMockGestioneDomandaCedRepository();
  const supportRecordRepo = createMockSupportRecordRepository();
  const useCase = makeCheckRequestUseCase(checkDomandaRepo, supportRecordRepo);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
      ok(undefined),
    );
    vi.mocked(supportRecordRepo.save).mockImplementation((record) =>
      Promise.resolve(ok(record)),
    );
  });

  it("returns a ValidationError for an invalid fiscal code", async () => {
    const result = await useCase({ fiscalCode: "short" });

    expect(checkDomandaRepo.checkDomanda).not.toHaveBeenCalled();
    expect(result).toEqual(err(expect.any(ValidationError)));
  });

  it("propagates an INPS error", async () => {
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

  it("returns a GenericError when an active state has no idLavorazione", async () => {
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      ok({
        esitoCheck: TipoEsitoCheck.NUMBER_20,
        idLavorazione: null,
      }),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
    expect(supportRecordRepo.save).not.toHaveBeenCalled();
  });

  it("propagates a Cosmos read error", async () => {
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      ok({
        esitoCheck: TipoEsitoCheck.NUMBER_20,
        idLavorazione: MOCK_ID_LAVORAZIONE,
      }),
    );
    vi.mocked(supportRecordRepo.getByCodiceFiscale).mockResolvedValue(
      err(new ServiceUnavailableError("Cosmos read failed")),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
  });

  it("propagates a Cosmos reconciliation write error", async () => {
    vi.mocked(checkDomandaRepo.checkDomanda).mockResolvedValue(
      ok({
        esitoCheck: TipoEsitoCheck.NUMBER_20,
        idLavorazione: MOCK_ID_LAVORAZIONE,
      }),
    );
    vi.mocked(supportRecordRepo.save).mockResolvedValue(
      err(new ServiceUnavailableError("Cosmos write failed")),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
  });
});

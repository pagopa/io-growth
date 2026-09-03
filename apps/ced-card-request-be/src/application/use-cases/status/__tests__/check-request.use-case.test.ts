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

import { createMockCardApplicationRepository } from "../../__tests__/mocks.js";
import { makeCheckRequestUseCase } from "../check-request.use-case.js";
import { createMockSupportRecordRepository } from "./mocks.js";

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

// eslint-disable-next-line max-lines-per-function
describe("makeCheckRequestUseCase", () => {
  const cardApplicationRepository = createMockCardApplicationRepository();
  const supportRecordRepository = createMockSupportRecordRepository();
  const useCase = makeCheckRequestUseCase(
    cardApplicationRepository,
    supportRecordRepository,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(undefined),
    );
    vi.mocked(supportRecordRepository.save).mockImplementation((record) =>
      Promise.resolve(ok(record)),
    );
  });

  it("returns READY_FOR_NEW_DRAFT without creating a record when no application exists", async () => {
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(
      ok({
        idLavorazione: null,
        state: "READY_FOR_NEW_DRAFT",
        status: "NO_APPLICATION",
      }),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(
      ok({ idLavorazione: null, state: "READY_FOR_NEW_DRAFT" }),
    );
    expect(supportRecordRepository.save).not.toHaveBeenCalled();
  });

  it("recreates a missing support record for an active draft", async () => {
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_PHOTO_UPLOAD",
        status: "DRAFT",
      }),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_PHOTO_UPLOAD",
      }),
    );
    expect(supportRecordRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        codiceFiscale: FISCAL_CODE,
        idLavorazione: MOCK_ID_LAVORAZIONE,
        lastReconciliation: {
          applicationStatus: "DRAFT",
          at: expect.any(String),
        },
        state: "READY_FOR_PHOTO_UPLOAD",
      }),
    );
  });

  it("completes a pending photo when the upstream milestone has advanced", async () => {
    const photo = pendingStep("photo-request");
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_DOCUMENTS_UPLOAD",
        status: "PHOTO_ATTACHED",
      }),
    );
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
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
    expect(supportRecordRepository.save).toHaveBeenCalledWith(
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

  it("keeps an unreflected photo step retryable", async () => {
    const photo = pendingStep("photo-request");
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_PHOTO_UPLOAD",
        status: "DRAFT",
      }),
    );
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(
        baseRecord({
          pendingStep: "PHOTO",
          steps: { confirm: null, draft: null, photo },
        }),
      ),
    );

    await useCase({ fiscalCode: FISCAL_CODE });

    expect(supportRecordRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        pendingStep: null,
        steps: { confirm: null, draft: null, photo },
      }),
    );
  });

  it("clears the active flow and preserves history for a closed application", async () => {
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_NEW_DRAFT",
        status: "CLOSED",
      }),
    );
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(
        baseRecord({
          numDomus: "OLD-DOMUS",
          pendingStep: "PHOTO",
          steps: {
            confirm: null,
            draft: pendingStep("draft-request"),
            photo: pendingStep("photo-request"),
          },
        }),
      ),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_NEW_DRAFT",
      }),
    );
    expect(supportRecordRepository.save).toHaveBeenCalledWith(
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

  it("returns numDomus from the reconciled acquired record", async () => {
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "ACQUIRED",
        status: "ACQUIRED",
      }),
    );
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
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

  it("returns a ValidationError for an invalid fiscal code", async () => {
    const result = await useCase({ fiscalCode: "short" });

    expect(
      cardApplicationRepository.checkApplicationState,
    ).not.toHaveBeenCalled();
    expect(result).toEqual(err(expect.any(ValidationError)));
  });

  it("propagates the card application repository error", async () => {
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(err(new GenericError("INPS unavailable")));

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
  });

  it("rejects an active state without idLavorazione", async () => {
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(
      ok({
        idLavorazione: null,
        state: "READY_FOR_PHOTO_UPLOAD",
        status: "DRAFT",
      }),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
    expect(supportRecordRepository.save).not.toHaveBeenCalled();
  });

  it("propagates a Cosmos read error", async () => {
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_PHOTO_UPLOAD",
        status: "DRAFT",
      }),
    );
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      err(new ServiceUnavailableError("Cosmos read failed")),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
  });

  it("propagates a Cosmos reconciliation write error", async () => {
    vi.mocked(
      cardApplicationRepository.checkApplicationState,
    ).mockResolvedValue(
      ok({
        idLavorazione: MOCK_ID_LAVORAZIONE,
        state: "READY_FOR_PHOTO_UPLOAD",
        status: "DRAFT",
      }),
    );
    vi.mocked(supportRecordRepository.save).mockResolvedValue(
      err(new ServiceUnavailableError("Cosmos write failed")),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
  });
});

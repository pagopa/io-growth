import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockCardApplicationRepository } from "../../__tests__/mocks.js";
import { makeUploadPhotoUseCase } from "../upload-photo.use-case.js";
import {
  baseSupportRecord,
  createMockSupportRecordRepository,
  MOCK_FISCAL_CODE,
  MOCK_ID_LAVORAZIONE,
  mockUploadPhotoInput,
} from "./mocks.js";

describe("makeUploadPhotoUseCase — validation, ownership, replay, retry", () => {
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
    makeUploadPhotoUseCase(supportRecordRepository, cardApplicationRepository);

  it("returns a ValidationError for invalid input without touching any repository", async () => {
    const result = await useCase()({
      ...mockUploadPhotoInput,
      codiceFiscale: "short",
    });

    expect(result).toEqual(err(expect.any(ValidationError)));
    expect(supportRecordRepository.getByCodiceFiscale).not.toHaveBeenCalled();
    expect(cardApplicationRepository.uploadPhoto).not.toHaveBeenCalled();
  });

  it("returns a ValidationError when there is no support record", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(undefined),
    );

    const result = await useCase()(mockUploadPhotoInput);

    expect(result).toEqual(err(expect.any(ValidationError)));
    expect(cardApplicationRepository.uploadPhoto).not.toHaveBeenCalled();
  });

  it("returns a ValidationError when idLavorazione does not match the active draft", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(baseSupportRecord({ idLavorazione: "OTHER-99999" })),
    );

    const result = await useCase()(mockUploadPhotoInput);

    expect(result).toEqual(err(expect.any(ValidationError)));
    expect(cardApplicationRepository.uploadPhoto).not.toHaveBeenCalled();
  });

  it("returns a ValidationError when the record has no idLavorazione yet", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(baseSupportRecord({ idLavorazione: null })),
    );

    const result = await useCase()(mockUploadPhotoInput);

    expect(result).toEqual(err(expect.any(ValidationError)));
  });

  it("replays a COMPLETED photo with the same client key without calling INPS", async () => {
    const existing = baseSupportRecord({
      state: "READY_FOR_DOCUMENTS_UPLOAD",
      steps: {
        confirm: null,
        draft: null,
        photo: {
          attempts: 1,
          clientRequestId: mockUploadPhotoInput.clientRequestId,
          completedAt: "2026-01-01T00:00:02.000Z",
          inpsIdempotencyKey: "inps-key-1",
          lastErrorCode: null,
          status: "COMPLETED",
          submittedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    });
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(existing),
    );

    const result = await useCase()(mockUploadPhotoInput);

    expect(result).toEqual(ok({ state: "READY_FOR_DOCUMENTS_UPLOAD" }));
    expect(cardApplicationRepository.uploadPhoto).not.toHaveBeenCalled();
    expect(supportRecordRepository.save).not.toHaveBeenCalled();
  });

  it("retries a PENDING photo by reusing the same INPS idempotency key", async () => {
    const existing = baseSupportRecord({
      pendingStep: "PHOTO",
      steps: {
        confirm: null,
        draft: null,
        photo: {
          attempts: 1,
          clientRequestId: mockUploadPhotoInput.clientRequestId,
          completedAt: null,
          inpsIdempotencyKey: "inps-key-1",
          lastErrorCode: null,
          status: "PENDING",
          submittedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    });
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(existing),
    );
    vi.mocked(cardApplicationRepository.uploadPhoto).mockResolvedValue(
      ok(undefined),
    );

    const result = await useCase()(mockUploadPhotoInput);

    expect(result).toEqual(ok({ state: "READY_FOR_DOCUMENTS_UPLOAD" }));
    expect(cardApplicationRepository.uploadPhoto).toHaveBeenCalledWith(
      {
        codiceFiscale: MOCK_FISCAL_CODE,
        fotoCED: mockUploadPhotoInput.fotoCED,
        idLavorazione: MOCK_ID_LAVORAZIONE,
        informativaFoto: true,
      },
      { idempotencyKey: "inps-key-1" },
    );
  });

  it("starts a new intent with a fresh INPS key and cascades a reset of confirm", async () => {
    const existing = baseSupportRecord({
      state: "READY_FOR_DOCUMENTS_UPLOAD",
      steps: {
        confirm: {
          attempts: 1,
          clientRequestId: "previous-confirm-key",
          completedAt: "2026-01-01T00:02:00.000Z",
          inpsIdempotencyKey: "old-confirm-key",
          lastErrorCode: null,
          status: "COMPLETED",
          submittedAt: "2026-01-01T00:01:30.000Z",
        },
        draft: null,
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
    vi.mocked(cardApplicationRepository.uploadPhoto).mockResolvedValue(
      ok(undefined),
    );

    const result = await useCase()(mockUploadPhotoInput);

    expect(result).toEqual(ok({ state: "READY_FOR_DOCUMENTS_UPLOAD" }));
    expect(supportRecordRepository.save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        pendingStep: "PHOTO",
        steps: expect.objectContaining({ confirm: null }),
      }),
    );
    const [, { idempotencyKey }] = vi.mocked(
      cardApplicationRepository.uploadPhoto,
    ).mock.calls[0];
    expect(idempotencyKey).not.toBe("old-photo-key");
  });
});

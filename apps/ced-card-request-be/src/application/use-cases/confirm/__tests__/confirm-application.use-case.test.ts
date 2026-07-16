import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockGestioneDomandaCedRepository } from "../../status/__tests__/mocks.js";
import { makeConfirmApplicationUseCase } from "../confirm-application.use-case.js";
import {
  baseSupportRecord,
  createMockSupportRecordRepository,
  MOCK_ID_LAVORAZIONE,
  mockConfirmApplicationInput,
} from "./mocks.js";

describe("makeConfirmApplicationUseCase — validation, ownership, replay, retry", () => {
  let supportRecordRepository: ReturnType<
    typeof createMockSupportRecordRepository
  >;
  let gestioneDomandaCedRepository: ReturnType<
    typeof createMockGestioneDomandaCedRepository
  >;

  beforeEach(() => {
    supportRecordRepository = createMockSupportRecordRepository();
    gestioneDomandaCedRepository = createMockGestioneDomandaCedRepository();
  });

  const useCase = () =>
    makeConfirmApplicationUseCase(
      supportRecordRepository,
      gestioneDomandaCedRepository,
    );

  it("returns a ValidationError for invalid input without touching any repository", async () => {
    const result = await useCase()({
      ...mockConfirmApplicationInput,
      codiceFiscale: "short",
    });

    expect(result).toEqual(err(expect.any(ValidationError)));
    expect(supportRecordRepository.getByCodiceFiscale).not.toHaveBeenCalled();
    expect(gestioneDomandaCedRepository.confermaDomanda).not.toHaveBeenCalled();
  });

  it("returns a ValidationError when there is no support record", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(undefined),
    );

    const result = await useCase()(mockConfirmApplicationInput);

    expect(result).toEqual(err(expect.any(ValidationError)));
    expect(gestioneDomandaCedRepository.confermaDomanda).not.toHaveBeenCalled();
  });

  it("returns a ValidationError when idLavorazione does not match the active draft", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(baseSupportRecord({ idLavorazione: "OTHER-99999" })),
    );

    const result = await useCase()(mockConfirmApplicationInput);

    expect(result).toEqual(err(expect.any(ValidationError)));
  });

  it("returns a ValidationError when the record has no idLavorazione yet", async () => {
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(baseSupportRecord({ idLavorazione: null })),
    );

    const result = await useCase()(mockConfirmApplicationInput);

    expect(result).toEqual(err(expect.any(ValidationError)));
  });

  it("replays a COMPLETED confirmation with the same client key without calling INPS", async () => {
    const existing = baseSupportRecord({
      state: "ACQUIRED",
      steps: {
        confirm: {
          attempts: 1,
          clientRequestId: mockConfirmApplicationInput.clientRequestId,
          completedAt: "2026-01-01T00:00:02.000Z",
          inpsIdempotencyKey: "inps-key-1",
          lastErrorCode: null,
          status: "COMPLETED",
          submittedAt: "2026-01-01T00:00:00.000Z",
        },
        draft: null,
        photo: null,
      },
    });
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(existing),
    );

    const result = await useCase()(mockConfirmApplicationInput);

    expect(result).toEqual(ok({ state: "ACQUIRED" }));
    expect(gestioneDomandaCedRepository.confermaDomanda).not.toHaveBeenCalled();
    expect(supportRecordRepository.save).not.toHaveBeenCalled();
  });

  it("retries a PENDING confirmation by reusing the same INPS idempotency key", async () => {
    const existing = baseSupportRecord({
      pendingStep: "CONFIRM",
      steps: {
        confirm: {
          attempts: 1,
          clientRequestId: mockConfirmApplicationInput.clientRequestId,
          completedAt: null,
          inpsIdempotencyKey: "inps-key-1",
          lastErrorCode: null,
          status: "PENDING",
          submittedAt: "2026-01-01T00:00:00.000Z",
        },
        draft: null,
        photo: null,
      },
    });
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(existing),
    );
    vi.mocked(gestioneDomandaCedRepository.confermaDomanda).mockResolvedValue(
      ok({ idLavorazione: MOCK_ID_LAVORAZIONE }),
    );

    const result = await useCase()(mockConfirmApplicationInput);

    expect(result).toEqual(ok({ state: "ACQUIRED" }));
    expect(gestioneDomandaCedRepository.confermaDomanda).toHaveBeenCalledWith(
      expect.anything(),
      { idempotencyKey: "inps-key-1" },
    );
  });

  it("starts a new intent with a fresh INPS key without touching draft/photo", async () => {
    const existing = baseSupportRecord({
      steps: {
        confirm: null,
        draft: {
          attempts: 1,
          clientRequestId: "draft-key",
          completedAt: "2026-01-01T00:00:02.000Z",
          inpsIdempotencyKey: "draft-inps-key",
          lastErrorCode: null,
          status: "COMPLETED",
          submittedAt: "2026-01-01T00:00:00.000Z",
        },
        photo: {
          attempts: 1,
          clientRequestId: "photo-key",
          completedAt: "2026-01-01T00:01:00.000Z",
          inpsIdempotencyKey: "photo-inps-key",
          lastErrorCode: null,
          status: "COMPLETED",
          submittedAt: "2026-01-01T00:00:30.000Z",
        },
      },
    });
    vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
      ok(existing),
    );
    vi.mocked(gestioneDomandaCedRepository.confermaDomanda).mockResolvedValue(
      ok({ idLavorazione: MOCK_ID_LAVORAZIONE }),
    );

    const result = await useCase()(mockConfirmApplicationInput);

    expect(result).toEqual(ok({ state: "ACQUIRED" }));
    expect(supportRecordRepository.save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        pendingStep: "CONFIRM",
        steps: expect.objectContaining({
          draft: existing.steps.draft,
          photo: existing.steps.photo,
        }),
      }),
    );
  });
});

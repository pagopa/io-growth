import {
  GenericError,
  ServiceUnavailableError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockGestioneDomandaCedRepository } from "../../status/__tests__/mocks.js";
import { makeUploadPhotoUseCase } from "../upload-photo.use-case.js";
import {
  baseSupportRecord,
  createMockSupportRecordRepository,
  mockUploadPhotoInput,
} from "./mocks.js";

describe("makeUploadPhotoUseCase — INPS and persistence outcomes", () => {
  let supportRecordRepository: ReturnType<
    typeof createMockSupportRecordRepository
  >;
  let gestioneDomandaCedRepository: ReturnType<
    typeof createMockGestioneDomandaCedRepository
  >;

  beforeEach(() => {
    supportRecordRepository = createMockSupportRecordRepository({
      getByCodiceFiscale: vi.fn().mockResolvedValue(ok(baseSupportRecord())),
    });
    gestioneDomandaCedRepository = createMockGestioneDomandaCedRepository();
  });

  const useCase = () =>
    makeUploadPhotoUseCase(
      supportRecordRepository,
      gestioneDomandaCedRepository,
    );

  describe("INPS outcomes", () => {
    it("invalidates a previous reconciliation snapshot after INPS accepts the photo", async () => {
      vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
        ok(
          baseSupportRecord({
            lastReconciliation: {
              at: "2026-01-01T00:00:00.000Z",
              esitoCheck: 20,
            },
          }),
        ),
      );
      vi.mocked(gestioneDomandaCedRepository.fornisciFoto).mockResolvedValue(
        ok({ idLavorazione: "ABC-12345" }),
      );

      await useCase()(mockUploadPhotoInput);

      expect(supportRecordRepository.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          lastReconciliation: null,
          state: "READY_FOR_DOCUMENTS_UPLOAD",
        }),
      );
    });

    it("marks the step FAILED and surfaces the 400 when INPS rejects the photo", async () => {
      vi.mocked(gestioneDomandaCedRepository.fornisciFoto).mockResolvedValue(
        err(new ValidationError("fornisciFoto rejected")),
      );

      const result = await useCase()(mockUploadPhotoInput);

      expect(result).toEqual(err(expect.any(ValidationError)));
      // Write 1 (intent) + best-effort FAILED write.
      expect(supportRecordRepository.save).toHaveBeenCalledTimes(2);
      expect(supportRecordRepository.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          pendingStep: null,
          steps: expect.objectContaining({
            photo: expect.objectContaining({ status: "FAILED" }),
          }),
        }),
      );
    });

    it("leaves the step PENDING and returns a GenericError on an INPS system error", async () => {
      vi.mocked(gestioneDomandaCedRepository.fornisciFoto).mockResolvedValue(
        err(new GenericError("INPS unavailable")),
      );

      const result = await useCase()(mockUploadPhotoInput);

      expect(result).toEqual(err(expect.any(GenericError)));
      // Only Write 1 (intent) — no outcome write, so the step stays PENDING.
      expect(supportRecordRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("persistence failures", () => {
    it("propagates a ServiceUnavailableError when reading the support record fails", async () => {
      vi.mocked(supportRecordRepository.getByCodiceFiscale).mockResolvedValue(
        err(new ServiceUnavailableError("Cosmos read failed")),
      );

      const result = await useCase()(mockUploadPhotoInput);

      expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
      expect(gestioneDomandaCedRepository.fornisciFoto).not.toHaveBeenCalled();
    });

    it("propagates a ServiceUnavailableError when Write 1 fails", async () => {
      vi.mocked(supportRecordRepository.save).mockResolvedValueOnce(
        err(new ServiceUnavailableError("Cosmos write failed")),
      );

      const result = await useCase()(mockUploadPhotoInput);

      expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
      expect(gestioneDomandaCedRepository.fornisciFoto).not.toHaveBeenCalled();
    });

    it("returns a GenericError when Write 2 fails after INPS already succeeded", async () => {
      vi.mocked(gestioneDomandaCedRepository.fornisciFoto).mockResolvedValue(
        ok({ idLavorazione: "ABC-12345" }),
      );
      vi.mocked(supportRecordRepository.save)
        .mockImplementationOnce((record) => Promise.resolve(ok(record)))
        .mockResolvedValueOnce(
          err(new ServiceUnavailableError("Cosmos write failed")),
        );

      const result = await useCase()(mockUploadPhotoInput);

      expect(result).toEqual(err(expect.any(GenericError)));
    });
  });
});

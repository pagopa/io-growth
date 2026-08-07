import {
  GenericError,
  ServiceUnavailableError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockCardApplicationRepository } from "../../__tests__/mocks.js";
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
  let cardApplicationRepository: ReturnType<
    typeof createMockCardApplicationRepository
  >;

  beforeEach(() => {
    supportRecordRepository = createMockSupportRecordRepository({
      getByCodiceFiscale: vi.fn().mockResolvedValue(ok(baseSupportRecord())),
    });
    cardApplicationRepository = createMockCardApplicationRepository();
  });

  const useCase = () =>
    makeUploadPhotoUseCase(supportRecordRepository, cardApplicationRepository);

  describe("INPS outcomes", () => {
    it("marks the step FAILED and surfaces the 400 when INPS rejects the photo", async () => {
      vi.mocked(cardApplicationRepository.uploadPhoto).mockResolvedValue(
        err(new ValidationError("photo rejected")),
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
      vi.mocked(cardApplicationRepository.uploadPhoto).mockResolvedValue(
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
      expect(cardApplicationRepository.uploadPhoto).not.toHaveBeenCalled();
    });

    it("propagates a ServiceUnavailableError when Write 1 fails", async () => {
      vi.mocked(supportRecordRepository.save).mockResolvedValueOnce(
        err(new ServiceUnavailableError("Cosmos write failed")),
      );

      const result = await useCase()(mockUploadPhotoInput);

      expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
      expect(cardApplicationRepository.uploadPhoto).not.toHaveBeenCalled();
    });

    it("returns a GenericError when Write 2 fails after INPS already succeeded", async () => {
      vi.mocked(cardApplicationRepository.uploadPhoto).mockResolvedValue(
        ok(undefined),
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

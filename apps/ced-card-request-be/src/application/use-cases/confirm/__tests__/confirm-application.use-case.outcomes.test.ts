import {
  GenericError,
  ServiceUnavailableError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockGestioneDomandaCedRepository } from "../../status/__tests__/mocks.js";
import { makeConfirmApplicationUseCase } from "../confirm-application.use-case.js";
import {
  baseSupportRecord,
  createMockSupportRecordRepository,
  mockConfirmApplicationInput,
} from "./mocks.js";

describe("makeConfirmApplicationUseCase — INPS and persistence outcomes", () => {
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
    makeConfirmApplicationUseCase(
      supportRecordRepository,
      gestioneDomandaCedRepository,
    );

  describe("INPS outcomes", () => {
    it("marks the step FAILED and surfaces the 400 when INPS rejects the confirmation", async () => {
      vi.mocked(gestioneDomandaCedRepository.confermaDomanda).mockResolvedValue(
        err(new ValidationError("confermaDomanda rejected")),
      );

      const result = await useCase()(mockConfirmApplicationInput);

      expect(result).toEqual(err(expect.any(ValidationError)));
      // Write 1 (intent) + best-effort FAILED write.
      expect(supportRecordRepository.save).toHaveBeenCalledTimes(2);
      expect(supportRecordRepository.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          pendingStep: null,
          steps: expect.objectContaining({
            confirm: expect.objectContaining({ status: "FAILED" }),
          }),
        }),
      );
    });

    it("leaves the step PENDING and returns a GenericError on an INPS system error", async () => {
      vi.mocked(gestioneDomandaCedRepository.confermaDomanda).mockResolvedValue(
        err(new GenericError("INPS unavailable")),
      );

      const result = await useCase()(mockConfirmApplicationInput);

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

      const result = await useCase()(mockConfirmApplicationInput);

      expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
      expect(
        gestioneDomandaCedRepository.confermaDomanda,
      ).not.toHaveBeenCalled();
    });

    it("propagates a ServiceUnavailableError when Write 1 fails", async () => {
      vi.mocked(supportRecordRepository.save).mockResolvedValueOnce(
        err(new ServiceUnavailableError("Cosmos write failed")),
      );

      const result = await useCase()(mockConfirmApplicationInput);

      expect(result).toEqual(err(expect.any(ServiceUnavailableError)));
      expect(
        gestioneDomandaCedRepository.confermaDomanda,
      ).not.toHaveBeenCalled();
    });

    it("returns a GenericError when Write 2 fails after INPS already succeeded", async () => {
      vi.mocked(gestioneDomandaCedRepository.confermaDomanda).mockResolvedValue(
        ok({ idLavorazione: "ABC-12345", numDomus: "DOMUS-999" }),
      );
      vi.mocked(supportRecordRepository.save)
        .mockImplementationOnce((record) => Promise.resolve(ok(record)))
        .mockResolvedValueOnce(
          err(new ServiceUnavailableError("Cosmos write failed")),
        );

      const result = await useCase()(mockConfirmApplicationInput);

      expect(result).toEqual(err(expect.any(GenericError)));
    });
  });
});

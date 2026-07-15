import { TipoEsitoCheck } from "@pagopa/io-core-adapter-inps-ced";
import { GenericError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeCheckRequestUseCase } from "../check-request.use-case.js";
import { createMockGestioneDomandaCedRepository } from "./mocks.js";

const FISCAL_CODE = "RSSMRA80A01H501U";

describe("makeCheckRequestUseCase", () => {
  const repository = createMockGestioneDomandaCedRepository();
  const useCase = makeCheckRequestUseCase(repository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    [TipoEsitoCheck.NUMBER_10, "READY_FOR_NEW_DRAFT"],
    [TipoEsitoCheck.NUMBER_20, "READY_FOR_PHOTO_UPLOAD"],
    [TipoEsitoCheck.NUMBER_30, "READY_FOR_DOCUMENTS_UPLOAD"],
    [TipoEsitoCheck.NUMBER_40, "ACQUIRED"],
    [TipoEsitoCheck.NUMBER_50, "READY_FOR_NEW_DRAFT"],
  ] as const)(
    "maps esitoCheck %s to state %s",
    async (esitoCheck, expectedState) => {
      vi.mocked(repository.checkDomanda).mockResolvedValue(
        ok({ esitoCheck, idLavorazione: "12345678901234567890" }),
      );

      const result = await useCase({ fiscalCode: FISCAL_CODE });

      expect(repository.checkDomanda).toHaveBeenCalledWith({
        codiceFiscale: FISCAL_CODE,
      });
      expect(result).toEqual(
        ok({ idLavorazione: "12345678901234567890", state: expectedState }),
      );
    },
  );

  it("returns a ValidationError for an invalid fiscal code", async () => {
    const result = await useCase({ fiscalCode: "short" });

    expect(repository.checkDomanda).not.toHaveBeenCalled();
    expect(result).toEqual(err(expect.any(ValidationError)));
  });

  it("propagates the repository error", async () => {
    vi.mocked(repository.checkDomanda).mockResolvedValue(
      err(new GenericError("INPS unavailable")),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
  });

  it("returns a GenericError when esitoCheck is missing", async () => {
    vi.mocked(repository.checkDomanda).mockResolvedValue(
      ok({ idLavorazione: null }),
    );

    const result = await useCase({ fiscalCode: FISCAL_CODE });

    expect(result).toEqual(err(expect.any(GenericError)));
  });
});

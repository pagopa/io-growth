import { ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockGestioneDomandaCedRepository } from "../../status/__tests__/mocks.js";
import { makeConfirmApplicationUseCase } from "../confirm-application.use-case.js";
import {
  baseSupportRecord,
  createMockSupportRecordRepository,
  MOCK_ID_LAVORAZIONE,
  mockConfirmApplicationInput,
} from "./mocks.js";

describe("makeConfirmApplicationUseCase — optional documentation mapping", () => {
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
    vi.mocked(gestioneDomandaCedRepository.confermaDomanda).mockResolvedValue(
      ok({ idLavorazione: MOCK_ID_LAVORAZIONE }),
    );
  });

  const useCase = () =>
    makeConfirmApplicationUseCase(
      supportRecordRepository,
      gestioneDomandaCedRepository,
    );

  it("omits ulterioreDocumentazione when tipologiaUlterioreDocumentazione is absent", async () => {
    await useCase()(mockConfirmApplicationInput);

    const [request] = vi.mocked(gestioneDomandaCedRepository.confermaDomanda)
      .mock.calls[0];
    expect(request.ulterioreDocumentazione).toBeUndefined();
  });

  it("builds ulterioreDocumentazione when tipologiaUlterioreDocumentazione is present", async () => {
    await useCase()({
      ...mockConfirmApplicationInput,
      nomeFile: "verbale.pdf",
      tipologiaUlterioreDocumentazione: 2,
    });

    const [request] = vi.mocked(gestioneDomandaCedRepository.confermaDomanda)
      .mock.calls[0];
    expect(request.ulterioreDocumentazione).toEqual(
      expect.objectContaining({
        nomeFile: "verbale.pdf",
        tipologiaUlterioreDocumentazione: 2,
      }),
    );
  });
});

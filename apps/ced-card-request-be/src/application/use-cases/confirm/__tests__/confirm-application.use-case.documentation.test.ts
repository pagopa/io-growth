import { ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockCardApplicationRepository } from "../../__tests__/mocks.js";
import { makeConfirmApplicationUseCase } from "../confirm-application.use-case.js";
import {
  baseSupportRecord,
  createMockSupportRecordRepository,
  MOCK_FISCAL_CODE,
  MOCK_ID_LAVORAZIONE,
  mockConfirmApplicationInput,
} from "./mocks.js";

/**
 * The use case's job is to turn validated input into the domain
 * `ApplicationConfirmation`. Reshaping that object into the INPS
 * `ulterioreDocumentazione` block belongs to the outbound adapter and is
 * covered by the mapper tests.
 */
describe("makeConfirmApplicationUseCase — documentation fields", () => {
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
    vi.mocked(cardApplicationRepository.confirmApplication).mockResolvedValue(
      ok({ numDomus: null }),
    );
  });

  const useCase = () =>
    makeConfirmApplicationUseCase(
      supportRecordRepository,
      cardApplicationRepository,
    );

  it("forwards the documentation fields when a documentation type is supplied", async () => {
    await useCase()({
      ...mockConfirmApplicationInput,
      nomeFile: "verbale.pdf",
      tipologiaUlterioreDocumentazione: 2,
    });

    const [confirmation] = vi.mocked(
      cardApplicationRepository.confirmApplication,
    ).mock.calls[0];
    expect(confirmation).toEqual(
      expect.objectContaining({
        nomeFile: "verbale.pdf",
        tipologiaUlterioreDocumentazione: 2,
      }),
    );
  });

  it("normalises omitted optionals to null and drops the client intent key", async () => {
    await useCase()({
      clientRequestId: mockConfirmApplicationInput.clientRequestId,
      codiceFiscale: MOCK_FISCAL_CODE,
      idLavorazione: MOCK_ID_LAVORAZIONE,
    });

    const [confirmation] = vi.mocked(
      cardApplicationRepository.confirmApplication,
    ).mock.calls[0];
    expect(confirmation).toEqual({
      allegato: null,
      autodichiarazioneSentenza: null,
      codiceFiscale: MOCK_FISCAL_CODE,
      dataSentenza: null,
      descrizioneComuneTribunale: null,
      dichiarazioneConformitaVerbale: null,
      dirittoAccompagnatore: null,
      idLavorazione: MOCK_ID_LAVORAZIONE,
      nomeFile: null,
      siglaProvinciaTribunale: null,
      tipologiaUlterioreDocumentazione: null,
    });
  });
});

import type { TipoEsitoCheck } from "@pagopa/io-core-adapter-inps-ced";

import { GenericError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ApplicationConfirmation,
  ApplicationDraft,
  ApplicationPhoto,
} from "../../../../domain/entities/card-application.js";

import { createInpsCardApplicationRepository } from "../inps-card-application.repository.js";
import { createMockGestioneDomandaCedRepository } from "./mocks.js";

const MOCK_FISCAL_CODE = "RSSMRA80A01H501U";
const MOCK_ID_LAVORAZIONE = "ABC-12345";
const IDEMPOTENCY = { idempotencyKey: "inps-key-1" };

const applicationDraft: ApplicationDraft = {
  capRec: "00100",
  civicoRec: "12",
  codiceFiscale: MOCK_FISCAL_CODE,
  cognome: "Rossi",
  comuneNascita: "Roma",
  dataNascita: "1980-01-01T00:00:00.000Z",
  dataScadenzaPermessoSoggiorno: null,
  datiAggiuntiviRec: null,
  descrizioneComuneRec: "Roma",
  idCittadinanza: 0,
  indirizzoRec: "Via Roma",
  informativaPrivacy: true,
  nome: "Mario",
  pressoCognome: null,
  pressoDenominazione: null,
  pressoNome: null,
  sesso: "M",
  siglaProvinciaNascita: "RM",
  siglaProvinciaRec: "RM",
  statoNascita: "ITALIA",
};

const applicationPhoto: ApplicationPhoto = {
  codiceFiscale: MOCK_FISCAL_CODE,
  fotoCED: "ZmFrZS1waG90by1ieXRlcw==",
  idLavorazione: MOCK_ID_LAVORAZIONE,
  informativaFoto: true,
};

const applicationConfirmation: ApplicationConfirmation = {
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
};

// eslint-disable-next-line max-lines-per-function
describe("createInpsCardApplicationRepository", () => {
  let gestioneDomandaCedRepository: ReturnType<
    typeof createMockGestioneDomandaCedRepository
  >;

  beforeEach(() => {
    gestioneDomandaCedRepository = createMockGestioneDomandaCedRepository();
  });

  const repository = () =>
    createInpsCardApplicationRepository(gestioneDomandaCedRepository);

  describe("createApplicationDraft", () => {
    it("flattens the domain draft into the nested INPS anagrafica/recapito shape", async () => {
      vi.mocked(
        gestioneDomandaCedRepository.nuovaDomandaInBozza,
      ).mockResolvedValue(ok({ idLavorazione: "NEW-11111" }));

      const result = await repository().createApplicationDraft(
        applicationDraft,
        IDEMPOTENCY,
      );

      expect(
        gestioneDomandaCedRepository.nuovaDomandaInBozza,
      ).toHaveBeenCalledWith(
        {
          anagrafica: {
            codiceFiscale: MOCK_FISCAL_CODE,
            cognome: "Rossi",
            comuneNascita: "Roma",
            dataNascita: "1980-01-01T00:00:00.000Z",
            dataScadenzaPermessoSoggiorno: null,
            idCittadinanza: 0,
            nome: "Mario",
            sesso: "M",
            siglaProvinciaNascita: "RM",
            statoNascita: "ITALIA",
          },
          informativaPrivacy: true,
          recapito: {
            cap: "00100",
            civico: "12",
            datiAggiuntivi: null,
            descrizioneComune: "Roma",
            indirizzo: "Via Roma",
            pressoCognome: null,
            pressoDenominazione: null,
            pressoNome: null,
            siglaProvincia: "RM",
          },
        },
        IDEMPOTENCY,
      );
      expect(result).toEqual(ok({ idLavorazione: "NEW-11111" }));
    });

    it("normalises an absent idLavorazione to null", async () => {
      vi.mocked(
        gestioneDomandaCedRepository.nuovaDomandaInBozza,
      ).mockResolvedValue(ok({}));

      const result = await repository().createApplicationDraft(
        applicationDraft,
        IDEMPOTENCY,
      );

      expect(result).toEqual(ok({ idLavorazione: null }));
    });

    it("forwards a ValidationError untouched so the use case can mark the step FAILED", async () => {
      const validationError = new ValidationError("INPS rejected the draft");
      vi.mocked(
        gestioneDomandaCedRepository.nuovaDomandaInBozza,
      ).mockResolvedValue(err(validationError));

      const result = await repository().createApplicationDraft(
        applicationDraft,
        IDEMPOTENCY,
      );

      expect(result).toEqual(err(validationError));
    });
  });

  describe("uploadPhoto", () => {
    it("translates the domain photo and discards the INPS response body", async () => {
      vi.mocked(gestioneDomandaCedRepository.fornisciFoto).mockResolvedValue(
        ok({ idLavorazione: MOCK_ID_LAVORAZIONE }),
      );

      const result = await repository().uploadPhoto(
        applicationPhoto,
        IDEMPOTENCY,
      );

      expect(gestioneDomandaCedRepository.fornisciFoto).toHaveBeenCalledWith(
        {
          codiceFiscale: MOCK_FISCAL_CODE,
          fotoCED: "ZmFrZS1waG90by1ieXRlcw==",
          idLavorazione: MOCK_ID_LAVORAZIONE,
          informativaFoto: true,
        },
        IDEMPOTENCY,
      );
      expect(result).toEqual(ok(undefined));
    });

    it("forwards a system error untouched", async () => {
      const genericError = new GenericError("INPS unavailable");
      vi.mocked(gestioneDomandaCedRepository.fornisciFoto).mockResolvedValue(
        err(genericError),
      );

      const result = await repository().uploadPhoto(
        applicationPhoto,
        IDEMPOTENCY,
      );

      expect(result).toEqual(err(genericError));
    });
  });

  describe("confirmApplication", () => {
    beforeEach(() => {
      vi.mocked(gestioneDomandaCedRepository.confermaDomanda).mockResolvedValue(
        ok({ numDomus: "DOMUS-001" }),
      );
    });

    it("omits ulterioreDocumentazione when no documentation type is set", async () => {
      const result = await repository().confirmApplication(
        applicationConfirmation,
        IDEMPOTENCY,
      );

      expect(gestioneDomandaCedRepository.confermaDomanda).toHaveBeenCalledWith(
        {
          codiceFiscale: MOCK_FISCAL_CODE,
          idLavorazione: MOCK_ID_LAVORAZIONE,
          ulterioreDocumentazione: undefined,
        },
        IDEMPOTENCY,
      );
      expect(result).toEqual(ok({ numDomus: "DOMUS-001" }));
    });

    it("builds ulterioreDocumentazione when a documentation type is set", async () => {
      await repository().confirmApplication(
        {
          ...applicationConfirmation,
          dataSentenza: "2020-05-01T00:00:00.000Z",
          descrizioneComuneTribunale: "Roma",
          nomeFile: "verbale.pdf",
          siglaProvinciaTribunale: "RM",
          tipologiaUlterioreDocumentazione: 2,
        },
        IDEMPOTENCY,
      );

      expect(gestioneDomandaCedRepository.confermaDomanda).toHaveBeenCalledWith(
        {
          codiceFiscale: MOCK_FISCAL_CODE,
          idLavorazione: MOCK_ID_LAVORAZIONE,
          ulterioreDocumentazione: {
            allegato: null,
            autodichiarazioneSentenza: null,
            dataSentenza: "2020-05-01T00:00:00.000Z",
            descrizioneComuneTribunale: "Roma",
            dichiarazioneConformitaVerbale: null,
            dirittoAccompagnatore: null,
            nomeFile: "verbale.pdf",
            siglaProvinciaTribunale: "RM",
            tipologiaUlterioreDocumentazione: 2,
          },
        },
        IDEMPOTENCY,
      );
    });

    it("normalises an absent numDomus to null", async () => {
      vi.mocked(gestioneDomandaCedRepository.confermaDomanda).mockResolvedValue(
        ok({ idLavorazione: MOCK_ID_LAVORAZIONE }),
      );

      const result = await repository().confirmApplication(
        applicationConfirmation,
        IDEMPOTENCY,
      );

      expect(result).toEqual(ok({ numDomus: null }));
    });
  });

  describe("checkApplicationState", () => {
    it.each([
      [10, "READY_FOR_NEW_DRAFT"],
      [20, "READY_FOR_PHOTO_UPLOAD"],
      [30, "READY_FOR_DOCUMENTS_UPLOAD"],
      [40, "ACQUIRED"],
      [50, "READY_FOR_NEW_DRAFT"],
    ] as const)("maps esitoCheck %s to %s", async (esitoCheck, state) => {
      vi.mocked(gestioneDomandaCedRepository.checkDomanda).mockResolvedValue(
        ok({ esitoCheck, idLavorazione: MOCK_ID_LAVORAZIONE }),
      );

      const result = await repository().checkApplicationState(MOCK_FISCAL_CODE);

      expect(gestioneDomandaCedRepository.checkDomanda).toHaveBeenCalledWith({
        codiceFiscale: MOCK_FISCAL_CODE,
      });
      expect(result).toEqual(ok({ idLavorazione: MOCK_ID_LAVORAZIONE, state }));
    });

    it("normalises an absent idLavorazione to null", async () => {
      vi.mocked(gestioneDomandaCedRepository.checkDomanda).mockResolvedValue(
        ok({ esitoCheck: 10 }),
      );

      const result = await repository().checkApplicationState(MOCK_FISCAL_CODE);

      expect(result).toEqual(
        ok({ idLavorazione: null, state: "READY_FOR_NEW_DRAFT" }),
      );
    });

    it("returns a GenericError when INPS omits esitoCheck", async () => {
      vi.mocked(gestioneDomandaCedRepository.checkDomanda).mockResolvedValue(
        ok({ idLavorazione: null }),
      );

      const result = await repository().checkApplicationState(MOCK_FISCAL_CODE);

      expect(result).toEqual(err(expect.any(GenericError)));
    });

    it("returns a GenericError when INPS introduces an unmapped esitoCheck", async () => {
      // A value INPS has not documented yet must not silently become a state.
      const unmapped = 99 as TipoEsitoCheck;
      vi.mocked(gestioneDomandaCedRepository.checkDomanda).mockResolvedValue(
        ok({ esitoCheck: unmapped, idLavorazione: MOCK_ID_LAVORAZIONE }),
      );

      const result = await repository().checkApplicationState(MOCK_FISCAL_CODE);

      expect(result).toEqual(err(expect.any(GenericError)));
    });

    it("forwards the INPS client error untouched", async () => {
      const genericError = new GenericError("INPS unavailable");
      vi.mocked(gestioneDomandaCedRepository.checkDomanda).mockResolvedValue(
        err(genericError),
      );

      const result = await repository().checkApplicationState(MOCK_FISCAL_CODE);

      expect(result).toEqual(err(genericError));
    });
  });
});

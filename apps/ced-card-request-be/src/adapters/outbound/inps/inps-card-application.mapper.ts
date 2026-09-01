import type {
  CheckDomandaResponse,
  ConfermaDomandaRequest,
  ConfermaDomandaResponse,
  FornisciFotoRequest,
  NuovaDomandaInBozzaRequest,
  NuovaDomandaInBozzaResponse,
  RecuperoDatiDomandaResponse,
} from "@pagopa/io-core-adapter-inps-ced";
import type { Result } from "neverthrow";

import { TipoEsitoCheck } from "@pagopa/io-core-adapter-inps-ced";
import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { z } from "zod";

import type { MilestoneState } from "../../../domain/entities/application-state.js";
import type {
  ApplicationConfirmation,
  ApplicationConfirmed,
  ApplicationDraft,
  ApplicationDraftCreated,
  ApplicationPhoto,
  ApplicationStateCheck,
  RecoveredApplicationDraft,
} from "../../../domain/entities/card-application.js";

import { RecoveredApplicationDraftSchema } from "../../../domain/entities/card-application.js";

/**
 * Maps the INPS `esitoCheck` milestone returned by CheckDomanda to the BFF
 * milestone state that directs the FE flow.
 *
 * | esitoCheck | Meaning                              | State                       |
 * |------------|--------------------------------------|-----------------------------|
 * | 10         | No draft on INPS                     | READY_FOR_NEW_DRAFT         |
 * | 20         | Draft, no photo                      | READY_FOR_PHOTO_UPLOAD      |
 * | 30         | Draft + photo                        | READY_FOR_DOCUMENTS_UPLOAD  |
 * | 40         | Acquired / processing                | ACQUIRED                    |
 * | 50         | Previous application closed (90/99)  | READY_FOR_NEW_DRAFT         |
 *
 * Returns `undefined` for any unmapped/unknown value.
 */
export const toMilestoneState = (
  esitoCheck: TipoEsitoCheck,
): MilestoneState | undefined => {
  switch (esitoCheck) {
    case TipoEsitoCheck.NUMBER_10:
    case TipoEsitoCheck.NUMBER_50:
      return "READY_FOR_NEW_DRAFT";
    case TipoEsitoCheck.NUMBER_20:
      return "READY_FOR_PHOTO_UPLOAD";
    case TipoEsitoCheck.NUMBER_30:
      return "READY_FOR_DOCUMENTS_UPLOAD";
    case TipoEsitoCheck.NUMBER_40:
      return "ACQUIRED";
    default:
      return undefined;
  }
};

export const toApplicationStateCheck = (
  response: CheckDomandaResponse,
): Result<ApplicationStateCheck, GenericError> => {
  if (response.esitoCheck === undefined) {
    return err(new GenericError("INPS CheckDomanda returned no esitoCheck"));
  }

  const state = toMilestoneState(response.esitoCheck);
  if (!state) {
    return err(
      new GenericError(
        `INPS CheckDomanda returned an unmapped esitoCheck: ${String(response.esitoCheck)}`,
      ),
    );
  }

  const status = (() => {
    switch (response.esitoCheck) {
      case TipoEsitoCheck.NUMBER_10:
        return "NO_APPLICATION" as const;
      case TipoEsitoCheck.NUMBER_20:
        return "DRAFT" as const;
      case TipoEsitoCheck.NUMBER_30:
        return "PHOTO_ATTACHED" as const;
      case TipoEsitoCheck.NUMBER_40:
        return "ACQUIRED" as const;
      case TipoEsitoCheck.NUMBER_50:
        return "CLOSED" as const;
    }
  })();

  if (!status) {
    return err(
      new GenericError(
        `INPS CheckDomanda returned an unmapped esitoCheck: ${String(response.esitoCheck)}`,
      ),
    );
  }

  return ok({
    idLavorazione: response.idLavorazione ?? null,
    state,
    status,
  });
};

export const toRecoveredApplicationDraft = (
  response: RecuperoDatiDomandaResponse,
): Result<RecoveredApplicationDraft, GenericError> => {
  const parsed = RecoveredApplicationDraftSchema.safeParse({
    capRec: response.recapito.cap,
    civicoRec: response.recapito.civico ?? null,
    codiceFiscale: response.anagrafica.codiceFiscale,
    cognome: response.anagrafica.cognome,
    comuneNascita: response.anagrafica.comuneNascita ?? null,
    dataNascita: response.anagrafica.dataNascita,
    dataScadenzaPermessoSoggiorno:
      response.anagrafica.dataScadenzaPermessoSoggiorno ?? null,
    datiAggiuntiviRec: response.recapito.datiAggiuntivi ?? null,
    descrizioneComuneRec: response.recapito.descrizioneComune,
    fotoCED: response.fotoCED ?? null,
    idCittadinanza: response.anagrafica.idCittadinanza,
    indirizzoRec: response.recapito.indirizzo,
    nome: response.anagrafica.nome,
    pressoCognome: response.recapito.pressoCognome ?? null,
    pressoDenominazione: response.recapito.pressoDenominazione ?? null,
    pressoNome: response.recapito.pressoNome ?? null,
    sesso: response.anagrafica.sesso,
    siglaProvinciaNascita: response.anagrafica.siglaProvinciaNascita ?? null,
    siglaProvinciaRec: response.recapito.siglaProvincia,
    statoNascita: response.anagrafica.statoNascita,
  });

  return parsed.success
    ? ok(parsed.data)
    : err(
        new GenericError(
          `INPS RecuperoDatiDomanda returned invalid data: ${z.prettifyError(parsed.error)}`,
        ),
      );
};

export const toApplicationConfirmed = (
  response: ConfermaDomandaResponse,
): ApplicationConfirmed => ({ numDomus: response.numDomus ?? null });

export const toApplicationDraftCreated = (
  response: NuovaDomandaInBozzaResponse,
): ApplicationDraftCreated => ({
  idLavorazione: response.idLavorazione ?? null,
});

/** Flattens the domain draft into the nested INPS anagrafica/recapito shape. */
export const toNuovaDomandaInBozzaRequest = (
  draft: ApplicationDraft,
): NuovaDomandaInBozzaRequest => ({
  anagrafica: {
    codiceFiscale: draft.codiceFiscale,
    cognome: draft.cognome,
    comuneNascita: draft.comuneNascita,
    dataNascita: draft.dataNascita,
    dataScadenzaPermessoSoggiorno: draft.dataScadenzaPermessoSoggiorno,
    idCittadinanza: draft.idCittadinanza,
    nome: draft.nome,
    sesso: draft.sesso,
    siglaProvinciaNascita: draft.siglaProvinciaNascita,
    statoNascita: draft.statoNascita,
  },
  informativaPrivacy: draft.informativaPrivacy,
  recapito: {
    cap: draft.capRec,
    civico: draft.civicoRec,
    datiAggiuntivi: draft.datiAggiuntiviRec,
    descrizioneComune: draft.descrizioneComuneRec,
    indirizzo: draft.indirizzoRec,
    pressoCognome: draft.pressoCognome,
    pressoDenominazione: draft.pressoDenominazione,
    pressoNome: draft.pressoNome,
    siglaProvincia: draft.siglaProvinciaRec,
  },
});

export const toFornisciFotoRequest = (
  photo: ApplicationPhoto,
): FornisciFotoRequest => ({
  codiceFiscale: photo.codiceFiscale,
  fotoCED: photo.fotoCED,
  idLavorazione: photo.idLavorazione,
  informativaFoto: photo.informativaFoto,
});

/**
 * `ulterioreDocumentazione` is omitted entirely when the citizen supplied no
 * documentation type — INPS rejects a partially filled block.
 */
export const toConfermaDomandaRequest = (
  confirmation: ApplicationConfirmation,
): ConfermaDomandaRequest => ({
  codiceFiscale: confirmation.codiceFiscale,
  idLavorazione: confirmation.idLavorazione,
  ulterioreDocumentazione:
    confirmation.tipologiaUlterioreDocumentazione === null
      ? undefined
      : {
          allegato: confirmation.allegato,
          autodichiarazioneSentenza: confirmation.autodichiarazioneSentenza,
          dataSentenza: confirmation.dataSentenza,
          descrizioneComuneTribunale: confirmation.descrizioneComuneTribunale,
          dichiarazioneConformitaVerbale:
            confirmation.dichiarazioneConformitaVerbale,
          dirittoAccompagnatore: confirmation.dirittoAccompagnatore,
          nomeFile: confirmation.nomeFile,
          siglaProvinciaTribunale: confirmation.siglaProvinciaTribunale,
          tipologiaUlterioreDocumentazione:
            confirmation.tipologiaUlterioreDocumentazione,
        },
});

import type {
  DraftDataResponse,
  NuovaDomandaInBozzaRequest,
} from '../../core/api/generated/model';

export interface RecoveredDraftState {
  readonly photoBase64?: string;
  readonly photoPreview?: string;
  readonly requestForm: NuovaDomandaInBozzaRequest;
}

const getPhotoMimeType = (photoBase64: string): string => {
  if (photoBase64.startsWith('iVBORw0KGgo')) {
    return 'image/png';
  }

  return 'image/jpeg';
};

export const buildRecoveredDraftState = (
  draft: DraftDataResponse,
): RecoveredDraftState => {
  const requestForm: NuovaDomandaInBozzaRequest = {
    capRec: draft.capRec,
    civicoRec: draft.civicoRec,
    cognome: draft.cognome,
    comuneNascita: draft.comuneNascita,
    dataNascita: draft.dataNascita,
    dataScadenzaPermessoSoggiorno: draft.dataScadenzaPermessoSoggiorno,
    datiAggiuntiviRec: draft.datiAggiuntiviRec,
    descrizioneComuneRec: draft.descrizioneComuneRec,
    idCittadinanza: draft.idCittadinanza,
    indirizzoRec: draft.indirizzoRec,
    informativaPrivacy: true,
    nome: draft.nome,
    pressoCognome: draft.pressoCognome,
    pressoDenominazione: draft.pressoDenominazione,
    pressoNome: draft.pressoNome,
    sesso: draft.sesso,
    siglaProvinciaNascita: draft.siglaProvinciaNascita,
    siglaProvinciaRec: draft.siglaProvinciaRec,
    statoNascita: draft.statoNascita,
  };

  if (!draft.fotoCED) {
    return { requestForm };
  }

  return {
    photoBase64: draft.fotoCED,
    photoPreview: `data:${getPhotoMimeType(draft.fotoCED)};base64,${draft.fotoCED}`,
    requestForm,
  };
};

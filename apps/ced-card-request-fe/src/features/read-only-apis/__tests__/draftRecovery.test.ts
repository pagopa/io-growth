import { describe, expect, it } from 'vitest';

import type { DraftDataResponse } from '../../../core/api/generated/model';

import { buildRecoveredDraftState } from '../draftRecovery';

const draft = (overrides?: Partial<DraftDataResponse>): DraftDataResponse => ({
  capRec: '00100',
  civicoRec: '1',
  codiceFiscale: 'RSSMRA80A01H501U',
  cognome: 'Rossi',
  comuneNascita: 'Roma',
  dataNascita: '01/01/1980',
  datiAggiuntiviRec: null,
  descrizioneComuneRec: 'Roma',
  idCittadinanza: 0,
  indirizzoRec: 'Via Roma',
  nome: 'Mario',
  sesso: 'M',
  siglaProvinciaNascita: 'RM',
  siglaProvinciaRec: 'RM',
  statoNascita: 'ITALIA',
  ...overrides,
});

describe('buildRecoveredDraftState', () => {
  it('maps personal and delivery data without leaking recovery-only fields', () => {
    const recovered = buildRecoveredDraftState(draft());

    expect(recovered).toEqual({
      requestForm: {
        capRec: '00100',
        civicoRec: '1',
        cognome: 'Rossi',
        comuneNascita: 'Roma',
        dataNascita: '01/01/1980',
        dataScadenzaPermessoSoggiorno: undefined,
        datiAggiuntiviRec: null,
        descrizioneComuneRec: 'Roma',
        idCittadinanza: 0,
        indirizzoRec: 'Via Roma',
        informativaPrivacy: true,
        nome: 'Mario',
        pressoCognome: undefined,
        pressoDenominazione: undefined,
        pressoNome: undefined,
        sesso: 'M',
        siglaProvinciaNascita: 'RM',
        siglaProvinciaRec: 'RM',
        statoNascita: 'ITALIA',
      },
    });
  });

  it.each([
    ['/9j/photo', 'data:image/jpeg;base64,/9j/photo'],
    ['iVBORw0KGgo-photo', 'data:image/png;base64,iVBORw0KGgo-photo'],
  ])(
    'builds the appropriate preview for a recovered photo',
    (photo, preview) => {
      const recovered = buildRecoveredDraftState(draft({ fotoCED: photo }));

      expect(recovered.photoBase64).toBe(photo);
      expect(recovered.photoPreview).toBe(preview);
    },
  );
});

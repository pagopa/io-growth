import { describe, expect, it } from 'vitest';

import { prefillApplicantData, requestFormReducer, setForm } from '../reducer';

describe('requestFormReducer', () => {
  it('prefills empty applicant fields', () => {
    const state = requestFormReducer(
      undefined,
      prefillApplicantData({
        cognome: 'Rossi',
        comuneNascita: 'ROMA',
        dataNascita: '1980-01-01',
        nome: 'Mario',
        sesso: 'M',
        siglaProvinciaNascita: 'RM',
        statoNascita: 'ITALIA',
      }),
    );

    expect(state).toMatchObject({
      cognome: 'Rossi',
      comuneNascita: 'ROMA',
      dataNascita: '1980-01-01',
      nome: 'Mario',
      sesso: 'M',
      siglaProvinciaNascita: 'RM',
      statoNascita: 'ITALIA',
    });
  });

  it('preserves applicant fields already entered by the user', () => {
    const stateWithUserInput = requestFormReducer(
      undefined,
      setForm({
        cognome: 'Bianchi',
        nome: 'Maria',
      }),
    );
    const state = requestFormReducer(
      stateWithUserInput,
      prefillApplicantData({
        cognome: 'Rossi',
        comuneNascita: 'ROMA',
        dataNascita: '1980-01-01',
        nome: 'Mario',
        sesso: 'M',
        siglaProvinciaNascita: 'RM',
        statoNascita: 'ITALIA',
      }),
    );

    expect(state).toMatchObject({
      cognome: 'Bianchi',
      comuneNascita: 'ROMA',
      dataNascita: '1980-01-01',
      nome: 'Maria',
      sesso: 'M',
      siglaProvinciaNascita: 'RM',
      statoNascita: 'ITALIA',
    });
  });
});

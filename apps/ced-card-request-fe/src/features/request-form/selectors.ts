import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';
import { RequestFormState } from './reducer';
import { toApiDateTime } from './date';

export const selectRequestForm = (state: RootState) => {
  const { dataNascita, ...rest } = state.request;

  return {
    ...rest,
    informativaPrivacy: true,
    dataNascita: toApiDateTime(dataNascita),
  };
};

export const withMockBirthData = (
  request: RequestFormState,
): RequestFormState => ({
  ...request,
  sesso: 'M',
  dataNascita: '1980-01-01T00:00:00.000Z',
  comuneNascita: 'Roma',
  statoNascita: 'ITALIA',
  siglaProvinciaNascita: 'RM',
});

export const makeSelectRequestFormField = createSelector(
  selectRequestForm,
  (request) => (field: keyof RequestFormState) => request[field],
);

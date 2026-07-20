import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';
import { RequestFormState } from './reducer';
import { parse } from 'date-fns';

const toIsoString = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  return parse(dateStr, 'dd/MM/yyyy', new Date()).toISOString();
};

export const selectRequestForm = (state: RootState) => {
  const { dataNascita, ...rest } = state.request;

  return {
    ...rest,
    dataNascita: toIsoString(dataNascita),
  };
};

export const makeSelectRequestFormField = createSelector(
  selectRequestForm,
  (request) => (field: keyof RequestFormState) => request[field],
);

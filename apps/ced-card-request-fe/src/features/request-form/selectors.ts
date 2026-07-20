import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';
import { RequestFormState } from './reducer';
import { parse } from 'date-fns';

export const selectRequestForm = (state: RootState) => {
  const { dataNascita, ...rest } = state.request;
  return {
    ...rest,
    dataNascita: parse(dataNascita, 'dd/MM/yyyy', new Date()).toISOString(),
  };
};

export const makeSelectRequestFormField = createSelector(
  selectRequestForm,
  (request) => (field: keyof RequestFormState) => request[field],
);

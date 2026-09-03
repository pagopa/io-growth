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

export const makeSelectRequestFormField = createSelector(
  selectRequestForm,
  (request) => (field: keyof RequestFormState) => request[field],
);

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';
import { RequestFormState } from './reducer';

const toIsoString = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');

  if (!day || !month || !year) return '';

  const utcDate = new Date(Date.UTC(+year, +month - 1, +day));

  return utcDate.toISOString();
};

export const selectRequestForm = (state: RootState) => {
  const { dataNascita, ...rest } = state.request;

  return {
    ...rest,
    informativaPrivacy: true,
    dataNascita: toIsoString(dataNascita),
  };
};

export const makeSelectRequestFormField = createSelector(
  selectRequestForm,
  (request) => (field: keyof RequestFormState) => request[field],
);

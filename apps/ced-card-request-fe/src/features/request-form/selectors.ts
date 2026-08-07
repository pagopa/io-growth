import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';
import { RequestFormState } from './reducer';

const toIsoString = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const dateParts = dateStr.includes('/')
    ? dateStr.split('/').reverse()
    : dateStr.split('-');
  const [year, month, day] = dateParts;

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

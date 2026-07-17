import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';
import { RequestFormState } from './reducer';

export const selectRequestForm = (state: RootState) => state.request;

export const makeSelectRequestFormField = createSelector(
  selectRequestForm,
  (request) => (field: keyof RequestFormState) => request[field],
);

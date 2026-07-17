import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';
import { RequestFormState } from './reducer';

const selectRequestSlice = (state: RootState) => state.request;

export const makeSelectRequestFormField = createSelector(
  selectRequestSlice,
  (request) => (field: keyof RequestFormState) => request[field],
);

export const selectRequestForm = (state: RootState) => state.request;

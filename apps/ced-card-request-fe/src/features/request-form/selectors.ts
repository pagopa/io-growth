import { RootState } from '../../core/store';
import { RequestFormState } from './reducer';

export const makeSelectRequestFormField =
  (state: RootState) => (field: keyof RequestFormState) =>
    state.request[field];

export const selectRequestForm = (state: RootState) => state.request;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../core/store';
import type { Contact } from '../location/types';

import type { WebsiteFormState } from './types';
import { isValidHttpsUrl } from '../../utils';

const createEmptyContact = (): Contact => ({
  type: null,
  value: null,
});

const createInitialState = (): WebsiteFormState => ({
  name: null,
  url: null,
  urlError: null,
  contacts: [createEmptyContact()],
});

const initialState: WebsiteFormState = createInitialState();

const websiteSlice = createSlice({
  name: 'website',
  initialState,
  reducers: {
    setWebsiteName(state, action: PayloadAction<string | null>) {
      state.name = action.payload;
    },
    setWebsiteUrl(state, action: PayloadAction<string | null>) {
      state.url = action.payload;
      state.urlError = null;
    },
    validateWebsiteUrl(state) {
      state.urlError =
        state.url && state.url.length > 0 && !isValidHttpsUrl(state.url)
          ? 'Inserisci un URL valido (es. https://...)'
          : null;
    },
    addWebsiteContact(state) {
      state.contacts.push(createEmptyContact());
    },
    removeWebsiteContact(state, action: PayloadAction<number>) {
      state.contacts.splice(action.payload, 1);
    },
    updateWebsiteContact(
      state,
      action: PayloadAction<{
        index: number;
        field: keyof Contact;
        value: string | null;
      }>,
    ) {
      const { index, field, value } = action.payload;
      if (state.contacts[index]) {
        state.contacts[index][field] = value;
      }
    },
    resetWebsiteForm() {
      return initialState;
    },
  },
});

export const {
  setWebsiteName,
  setWebsiteUrl,
  validateWebsiteUrl,
  addWebsiteContact,
  removeWebsiteContact,
  updateWebsiteContact,
  resetWebsiteForm,
} = websiteSlice.actions;

export const websiteReducer = websiteSlice.reducer;

export const selectWebsiteForm = (state: RootState) => state.website;
export const selectWebsiteUrlError = (state: RootState) =>
  state.website.urlError;
export const selectIsWebsiteFormValid = (state: RootState) => {
  const { name, url } = state.website;
  return !!name && name.trim().length > 0 && !!url && isValidHttpsUrl(url);
};

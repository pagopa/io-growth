import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../core/store';
import type { Contact } from '../location/types';

import type { WebsiteFormState } from './types';
import { isValidHttpsUrl } from '../../utils';

const initialState: WebsiteFormState = {
  name: '',
  url: '',
  urlError: '',
  contacts: [{ type: '', value: '' }],
};

const websiteSlice = createSlice({
  name: 'website',
  initialState,
  reducers: {
    setWebsiteName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setWebsiteUrl(state, action: PayloadAction<string>) {
      state.url = action.payload;
      state.urlError = '';
    },
    validateWebsiteUrl(state) {
      state.urlError =
        state.url.length > 0 && !isValidHttpsUrl(state.url)
          ? 'Inserisci un URL valido (es. https://...)'
          : '';
    },
    addWebsiteContact(state) {
      state.contacts.push({ type: '', value: '' });
    },
    removeWebsiteContact(state, action: PayloadAction<number>) {
      state.contacts.splice(action.payload, 1);
    },
    updateWebsiteContact(
      state,
      action: PayloadAction<{
        index: number;
        field: keyof Contact;
        value: string;
      }>,
    ) {
      const { index, field, value } = action.payload;
      state.contacts[index][field] = value;
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
  return name.trim().length > 0 && isValidHttpsUrl(url);
};

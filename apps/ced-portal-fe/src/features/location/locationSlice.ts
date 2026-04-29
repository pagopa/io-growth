import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../core/store';
import type { AddressOption, Contact, LocationFormState } from './types';

const createEmptyContact = (): Contact => ({
  type: null,
  value: null,
});

const createInitialState = (): LocationFormState => ({
  name: '',
  address: '',
  city: '',
  postalCode: '',
  province: '',
  contacts: [createEmptyContact()],
});

const initialState: LocationFormState = createInitialState();

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocationName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setLocationAddress(state, action: PayloadAction<string>) {
      state.address = action.payload;
      if (!state.address) {
        state.city = null;
        state.postalCode = null;
        state.province = null;
      }
    },
    setLocationAddressFromOption(state, action: PayloadAction<AddressOption>) {
      state.address = action.payload.label;
      state.city = action.payload.city;
      state.postalCode = action.payload.postalCode;
      state.province = action.payload.province;
    },
    setLocationCity(state, action: PayloadAction<string | null>) {
      state.city = action.payload;
    },
    setLocationPostalCode(state, action: PayloadAction<string | null>) {
      state.postalCode = action.payload;
    },
    setLocationProvince(state, action: PayloadAction<string | null>) {
      state.province = action.payload;
    },
    addLocationContact(state) {
      state.contacts.push(createEmptyContact());
    },
    removeLocationContact(state, action: PayloadAction<number>) {
      state.contacts.splice(action.payload, 1);
    },
    updateLocationContact(
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
    resetLocationForm() {
      return initialState;
    },
  },
});

export const {
  setLocationName,
  setLocationAddress,
  setLocationAddressFromOption,
  setLocationCity,
  setLocationPostalCode,
  setLocationProvince,
  addLocationContact,
  removeLocationContact,
  updateLocationContact,
  resetLocationForm,
} = locationSlice.actions;

export const locationReducer = locationSlice.reducer;

export const selectLocationForm = (state: RootState) => state.location;

export const selectIsLocationFormValid = (state: RootState) => {
  const { name, address, city } = state.location;
  return !!name && !!address && !!city;
};

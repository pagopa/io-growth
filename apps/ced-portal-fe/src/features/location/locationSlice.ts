import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../core/store';
import type { AddressOption, Contact, LocationFormState } from './types';

const initialState: LocationFormState = {
  name: '',
  address: '',
  addressSelected: false,
  city: '',
  postalCode: '',
  province: '',
  contacts: [{ type: '', value: '' }],
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocationName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setLocationAddress(state, action: PayloadAction<string>) {
      state.address = action.payload;
      state.addressSelected = false;
      if (!action.payload) {
        state.city = '';
        state.postalCode = '';
        state.province = '';
      }
    },
    setLocationAddressFromOption(state, action: PayloadAction<AddressOption>) {
      state.address = action.payload.label;
      state.addressSelected = true;
      state.city = action.payload.city;
      state.postalCode = action.payload.postalCode;
      state.province = action.payload.province;
    },
    setLocationCity(state, action: PayloadAction<string>) {
      state.city = action.payload;
    },
    setLocationPostalCode(state, action: PayloadAction<string>) {
      state.postalCode = action.payload;
    },
    setLocationProvince(state, action: PayloadAction<string>) {
      state.province = action.payload;
    },
    addLocationContact(state) {
      state.contacts.push({ type: '', value: '' });
    },
    removeLocationContact(state, action: PayloadAction<number>) {
      state.contacts.splice(action.payload, 1);
    },
    updateLocationContact(
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
  const { name, address, addressSelected } = state.location;
  return name.trim().length > 0 && address.trim().length > 0 && addressSelected;
};

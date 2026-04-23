import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { useCreateLocationMutation, useSearchAddressesQuery } from './api';
import {
  resetLocationForm,
  selectLocationForm,
  setLocationAddress,
  setLocationAddressFromOption,
} from './locationSlice';
import type { AddressOption, Location } from './types';

export function useLocationSubmit(
  onConfirm: (newLocation?: Location) => void,
  onClose: () => void,
) {
  const dispatch = useAppDispatch();
  const locationForm = useAppSelector(selectLocationForm);
  const [createLocation, { isLoading }] = useCreateLocationMutation();

  const handleConfirm = async () => {
    const { name, address, city, postalCode, province, contacts } =
      locationForm;

    // Validate required fields are not null/empty
    if (!name?.trim() || !address?.trim() || !city?.trim()) {
      console.error('Required fields are missing');
      return;
    }

    // Filter out invalid contacts
    const validContacts = contacts
      .filter((c) => c.type?.trim() && c.value?.trim())
      .map((c) => ({
        type: c.type!.trim(),
        value: c.value!.trim(),
      }));

    const result = await createLocation({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode?.trim() || '',
      province: province?.trim() || '',
      contacts: validContacts,
    });

    if ('error' in result) return;
    dispatch(resetLocationForm());
    onConfirm(result.data);
  };

  const handleClose = () => {
    dispatch(resetLocationForm());
    onClose();
  };

  return { handleConfirm, handleClose, isLoading };
}

export function useLocationAddressSearch(existingLocations: Location[]) {
  const dispatch = useAppDispatch();
  const { address } = useAppSelector(selectLocationForm);

  // Ensure address is a valid string
  const searchAddress = address?.trim() || '';

  const { data: rawAddressOptions = [] } = useSearchAddressesQuery(
    searchAddress,
    {
      skip: searchAddress.length < 3,
    },
  );

  const usedAddresses = useMemo(
    () => new Set(existingLocations.map((s) => s.address.toLowerCase())),
    [existingLocations],
  );

  const addressOptions = useMemo(
    () =>
      rawAddressOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(searchAddress.toLowerCase()) &&
          !usedAddresses.has(o.label.toLowerCase()),
      ),
    [rawAddressOptions, searchAddress, usedAddresses],
  );

  return {
    addressOptions,
    handleAddressChange: (val: string) => dispatch(setLocationAddress(val)),
    handleAddressSelect: (option: AddressOption) =>
      dispatch(setLocationAddressFromOption(option)),
  };
}

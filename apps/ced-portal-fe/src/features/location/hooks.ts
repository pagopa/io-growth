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
    const result = await createLocation({
      name,
      address,
      city,
      postalCode,
      province,
      contacts,
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

  const { data: rawAddressOptions = [] } = useSearchAddressesQuery(address, {
    skip: address.trim().length < 3,
  });

  const usedAddresses = useMemo(
    () => new Set(existingLocations.map((s) => s.address.toLowerCase())),
    [existingLocations],
  );

  const addressOptions = useMemo(
    () =>
      rawAddressOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(address.toLowerCase()) &&
          !usedAddresses.has(o.label.toLowerCase()),
      ),
    [rawAddressOptions, address, usedAddresses],
  );

  return {
    addressOptions,
    handleAddressChange: (val: string) => dispatch(setLocationAddress(val)),
    handleAddressSelect: (option: AddressOption) =>
      dispatch(setLocationAddressFromOption(option)),
  };
}

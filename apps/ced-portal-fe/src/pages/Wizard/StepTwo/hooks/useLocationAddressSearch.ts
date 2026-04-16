import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { useSearchAddressesQuery } from '../../../../features/location/api';
import {
  selectLocationForm,
  setLocationAddress,
  setLocationAddressFromOption,
} from '../../../../features/location/locationSlice';
import type { Location } from '../../../../features/location/types';

export function useLocationAddressSearch(existingLocations: Location[]) {
  const dispatch = useAppDispatch();
  const { address, addressSelected } = useAppSelector(selectLocationForm);
  const [addressFocused, setAddressFocused] = useState(false);

  const { data: rawAddressOptions = [] } = useSearchAddressesQuery(address, {
    skip: address.trim().length < 3 || addressSelected,
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

  const autocompleteOpen =
    addressOptions.length > 0 && !addressSelected && addressFocused;

  const handleAddressInputChange = (_: unknown, val: string, reason: string) => {
    if (reason === 'input') {
      dispatch(setLocationAddress(val));
    } else if (reason === 'reset' && val) {
      const selected = rawAddressOptions.find((o) => o.label === val);
      if (selected) dispatch(setLocationAddressFromOption(selected));
    }
  };

  return {
    addressOptions,
    autocompleteOpen,
    handleAddressInputChange,
    onFocus: () => setAddressFocused(true),
    onBlur: () => setAddressFocused(false),
  };
}

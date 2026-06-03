import {
  removeSelectedLocationId,
  setSelectedLocationIds,
} from '../../../../features/places/placesSlice';
import { selectSelectedLocationIds } from '../../../../features/places/selectors';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { useSelectionFlow } from './useSelectionFlow';

export function useLocationSelectionFlow() {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedLocationIds);
  return useSelectionFlow({
    selectedIds,
    onSetSelectedIds: (ids) => dispatch(setSelectedLocationIds(ids)),
    onRemoveId: (id) => dispatch(removeSelectedLocationId(id)),
    toastMessage: 'Sedi aggiunte!',
  });
}

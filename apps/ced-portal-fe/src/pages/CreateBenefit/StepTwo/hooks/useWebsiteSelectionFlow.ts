import {
  removeSelectedWebsiteId,
  setSelectedWebsiteIds,
} from '../../../../features/places/placesSlice';
import { selectSelectedWebsiteIds } from '../../../../features/places/selectors';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { useSelectionFlow } from './useSelectionFlow';

export function useWebsiteSelectionFlow() {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedWebsiteIds);
  return useSelectionFlow({
    selectedIds,
    onSetSelectedIds: (ids) => dispatch(setSelectedWebsiteIds(ids)),
    onRemoveId: (id) => dispatch(removeSelectedWebsiteId(id)),
    toastMessage: 'Siti web aggiunti!',
  });
}

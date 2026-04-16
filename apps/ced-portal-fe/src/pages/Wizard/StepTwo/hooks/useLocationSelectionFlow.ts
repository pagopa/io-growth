import { useState } from 'react';
import { useToast } from '../../../../contexts/ToastContext';
import type { Location } from '../../../../features/location/types';
import {
  removeSelectedSedeId,
  selectSelectedSedeIds,
  setSelectedSedeIds,
} from '../../../../features/wizard/slice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import type { ModalState } from '../constants';

export function useLocationSelectionFlow() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const selectedLocationIds = useAppSelector(selectSelectedSedeIds);

  const [modal, setModal] = useState<ModalState>('none');
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);

  const handleAddClick = (hasLocations: boolean) => {
    if (hasLocations) {
      setPendingSelection([...selectedLocationIds]);
      setModal('select');
    } else {
      setModal('add');
    }
  };

  const handleAddConfirm = (newLocation?: Location) => {
    const backToSelect = modal === 'add-from-select';
    if (newLocation) {
      if (backToSelect) {
        setPendingSelection((prev) => [...prev, newLocation.id]);
      } else {
        dispatch(setSelectedSedeIds([...selectedLocationIds, newLocation.id]));
      }
    }
    if (!backToSelect) showToast('Sedi aggiunte!', 'success');
    setModal(backToSelect ? 'select' : 'none');
  };

  const handleSelectConfirm = (ids: string[]) => {
    dispatch(setSelectedSedeIds(ids));
    setPendingSelection([]);
    setModal('none');
    showToast('Sedi aggiunte!', 'success');
  };

  const handleSelectClose = () => {
    setPendingSelection([]);
    setModal('none');
  };

  const handleAddNew = () => setModal('add-from-select');
  const handleBack = () => setModal('select');
  const handleAddClose = () => setModal('none');
  const handleRemove = (id: string) => dispatch(removeSelectedSedeId(id));

  return {
    modal,
    pendingSelection,
    setPendingSelection,
    handleAddClick,
    handleAddConfirm,
    handleSelectConfirm,
    handleSelectClose,
    handleAddNew,
    handleBack,
    handleAddClose,
    handleRemove,
  };
}

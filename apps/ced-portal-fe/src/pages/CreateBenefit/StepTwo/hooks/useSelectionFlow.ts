import { useState } from 'react';
import { useToast } from '../../../../contexts';
import type { ModalState } from '../constants';

interface SelectionFlowConfig {
  selectedIds: string[];
  onSetSelectedIds: (ids: string[]) => void;
  onRemoveId: (id: string) => void;
  toastMessage: string;
}

export function useSelectionFlow({
  selectedIds,
  onSetSelectedIds,
  onRemoveId,
  toastMessage,
}: SelectionFlowConfig) {
  const { showToast } = useToast();
  const [modal, setModal] = useState<ModalState>('none');
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);

  const handleAddClick = (hasItems: boolean) => {
    if (hasItems) {
      setPendingSelection([...selectedIds]);
      setModal('select');
    } else {
      setModal('add');
    }
  };

  const handleAddConfirm = (newItem?: { id: string }) => {
    const backToSelect = modal === 'add-from-select';
    if (newItem) {
      if (backToSelect) {
        setPendingSelection((prev) => [...prev, newItem.id]);
      } else {
        onSetSelectedIds([...selectedIds, newItem.id]);
      }
    }
    if (!backToSelect) showToast(toastMessage, 'success');
    setModal(backToSelect ? 'select' : 'none');
  };

  const handleSelectConfirm = (ids: string[]) => {
    onSetSelectedIds(ids);
    setPendingSelection([]);
    setModal('none');
    showToast(toastMessage, 'success');
  };

  const handleSelectClose = () => {
    setPendingSelection([]);
    setModal('none');
  };

  const handleAddNew = () => setModal('add-from-select');
  const handleBack = () => setModal('select');
  const handleAddClose = () => setModal('none');

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
    handleRemove: onRemoveId,
  };
}

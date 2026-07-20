import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';

export const selectStatus = (state: RootState) => state.status;

export const selectIdLavorazione = createSelector(
  selectStatus,
  (status) => status.idLavorazione,
);

export const selectApplicationStatus = createSelector(
  selectStatus,
  (status) => status.state,
);

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';

const selectStatus = (state: RootState) => state.status;

export const selectIdLavorazione = createSelector(
  selectStatus,
  (status) => status.idLavorazione,
);

export const selectNumDomus = createSelector(
  selectStatus,
  (status) => status.numDomus,
);

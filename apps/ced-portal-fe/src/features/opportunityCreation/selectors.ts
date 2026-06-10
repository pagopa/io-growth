import { createSelector } from '@reduxjs/toolkit/react';
import type {
  OpportunityCreateRequest,
  LocalizedMetadataItemLanguage,
  LocalizedMetadataItemKey,
} from '../../core/api/generated/model';
import { RootState } from '../../core/store';
import type {
  OpportunityCreationForm,
  OpportunityCreationState,
} from './opportunityCreationSlice';

export const baseSelectOpportunityForm = (state: {
  opportunityCreation: OpportunityCreationState;
}): OpportunityCreationForm => state.opportunityCreation.form;

// Base selector
export const selectActiveFormLanguage = (state: {
  opportunityCreation: OpportunityCreationState;
}) => state.opportunityCreation.activeLanguage;

export const selectEnabledCaregiver = (state: {
  opportunityCreation: OpportunityCreationState;
}) => state.opportunityCreation.caregiverEnabled;

export const selectOpportunityForm = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state);

export const selectDateFrom = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).dateFrom ?? '';

export const selectDateTo = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).dateTo ?? '';

export const selectUrl = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).url ?? '';

export const selectCategoryId = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).categoryId ?? '';

export const selectPlaceIds = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).placeIds;

export const selectBeneficiaryBenefit = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).beneficiaryBenefit;

export const selectNationalTerritory = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).nationalTerritory;

export const selectCaregiverBenefit = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).caregiverBenefit;

export const selectLocalizedMetadata = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).localizedMetadata;

export const selectLocalizedValue =
  (
    language: LocalizedMetadataItemLanguage,
    key: 'name' | 'description' | 'condition',
  ) =>
  (state: RootState) =>
    baseSelectOpportunityForm(state).localizedMetadata[language]?.[key];

const getValueByPath = <TSource extends object, TResult = unknown>(
  source: TSource | undefined,
  keyPath: string,
): TResult | undefined =>
  keyPath
    .split('.')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce<unknown>((current, segment: string) => {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      return (current as Record<string, unknown>)[segment];
    }, source as unknown) as TResult | undefined;

export const selectFormValueByPath =
  <TResult = unknown>(path: string) =>
  (state: RootState): TResult | undefined =>
    getValueByPath<OpportunityCreationForm, TResult>(
      baseSelectOpportunityForm(state),
      path,
    );

const localizedMetadataRecordToArray = (
  localizedMetadata: Record<LocalizedMetadataItemLanguage, Record<string, any>>,
) =>
  Object.entries(localizedMetadata).flatMap(([language, fields]) =>
    Object.entries(fields).map(([key, value]) => ({
      language: language as LocalizedMetadataItemLanguage,
      key: key as LocalizedMetadataItemKey,
      value,
    })),
  );

// Build a payload ready for BE submission. Returns null if required fields are missing.
export const selectFormattedForSubmit = (state: {
  opportunityCreation: OpportunityCreationState;
}): OpportunityCreateRequest | null => {
  const form = baseSelectOpportunityForm(state);

  if (!form.dateFrom) return null;
  if (!form.categoryId) return null;
  if (!form.placeIds || form.placeIds.length === 0) return null;
  if (!form.beneficiaryBenefit) return null;

  const payload: OpportunityCreateRequest = {
    dateFrom: form.dateFrom,
    categoryId: form.categoryId,
    placeIds: form.placeIds,
    beneficiaryBenefit: form.beneficiaryBenefit,
    localizedMetadata: localizedMetadataRecordToArray(form.localizedMetadata),
  };

  if (form.dateTo) payload.dateTo = form.dateTo;
  if (form.url) payload.url = form.url;
  if (form.caregiverBenefit) payload.caregiverBenefit = form.caregiverBenefit;

  return payload;
};

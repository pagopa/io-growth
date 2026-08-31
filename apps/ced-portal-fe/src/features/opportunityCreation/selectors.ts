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

export const selectIsSameConditionsCaregiver = (state: {
  opportunityCreation: OpportunityCreationState;
}) => !!state.opportunityCreation.caregiverHasSameConditions;

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

export const selectBeneficiaryBenefit = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).beneficiaryBenefit;

export const selectNationalTerritory = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).nationalTerritory;

export const selectCaregiverBenefit = (state: {
  opportunityCreation: OpportunityCreationState;
}) => baseSelectOpportunityForm(state).caregiverBenefit;

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

import { useEffect, useRef } from 'react';
import { useGetOpportunityDetailQuery } from '../../../features/opportunities/api';
import {
  setAccessPoint,
  setNationwide,
  setSelectedLocationIds,
  setSelectedWebsiteIds,
} from '../../../features/wizard/slice';
import {
  resetAgreementDetailCreationForm,
  setActiveLanguage,
  setBenefitUrl,
  setCompanionBenefitEnabled,
  setCompanionBenefitType,
  setCompanionDiscountValue,
  setCompanionDiscountValueType,
  setCompanionOtherBenefitTypeDescription,
  setEndDate,
  setHasEndDate,
  setLocalizedField,
  setSameConditionAsOwner,
  setStartDate,
} from '../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { useAppDispatch } from '../../../hooks/store';
import {
  AGREEMENT_LANGUAGE_TABS,
  DEFAULT_AGREEMENT_LANGUAGE,
} from '../StepOne/AgreementCompanionSection/utils/agreementLanguageTabs.config';
import type {
  CreateBenefitLanguageId,
  CreateBenefitNavigationState,
} from '../types';
import { buildOpportunityPrefillData } from '../utils/opportunityPrefill';
import { useGetPlacesQuery } from '../../../features/places/api';

export const useHydrateFromSourceOpportunity = (
  sourceOpportunityId:
    | CreateBenefitNavigationState['sourceOpportunityId']
    | null,
) => {
  const dispatch = useAppDispatch();
  const hydratedSourceRef = useRef<string | null>(null);

  const { data: sourceOpportunityDetail } = useGetOpportunityDetailQuery(
    sourceOpportunityId ?? '',
    {
      skip: !sourceOpportunityId,
    },
  );

  const { data: places = [], isLoading: isPlacesLoading } = useGetPlacesQuery(
    undefined,
    {
      skip: !sourceOpportunityId,
    },
  );

  const availableLocations = places.filter(({ type }) => type === 'offline');
  const availableWebsites = places.filter(({ type }) => type === 'online');

  useEffect(() => {
    dispatch(resetAgreementDetailCreationForm());
    dispatch(setActiveLanguage(DEFAULT_AGREEMENT_LANGUAGE));
    dispatch(setNationwide(false));
    dispatch(setAccessPoint(''));
    dispatch(setSelectedLocationIds([]));
    dispatch(setSelectedWebsiteIds([]));

    hydratedSourceRef.current = null;
  }, [dispatch, sourceOpportunityId]);

  useEffect(() => {
    if (!sourceOpportunityId || !sourceOpportunityDetail) {
      return;
    }

    if (hydratedSourceRef.current === sourceOpportunityId) {
      return;
    }

    if (isPlacesLoading) {
      return;
    }

    const prefillData = buildOpportunityPrefillData(
      sourceOpportunityDetail,
      availableLocations.map(({ id }) => id),
      availableWebsites.map(({ id }) => id),
    );

    dispatch(setActiveLanguage(AGREEMENT_LANGUAGE_TABS[0].id));
    dispatch(setNationwide(false));
    dispatch(setAccessPoint(prefillData.accessPoint));
    dispatch(setSelectedLocationIds(prefillData.preselectedLocationIds));
    dispatch(setSelectedWebsiteIds(prefillData.preselectedWebsiteIds));

    const applyCompanionPrefill = (languageId: CreateBenefitLanguageId) => {
      if (!prefillData.caregiverValues) {
        dispatch(
          setCompanionBenefitEnabled({
            languageId,
            value: false,
          }),
        );
        return;
      }

      dispatch(
        setCompanionBenefitEnabled({
          languageId,
          value: true,
        }),
      );
      dispatch(
        setSameConditionAsOwner({
          languageId,
          value: false,
        }),
      );
      dispatch(
        setCompanionBenefitType({
          languageId,
          value: prefillData.caregiverValues.benefitType,
        }),
      );
      dispatch(
        setCompanionDiscountValueType({
          languageId,
          value: prefillData.caregiverValues.benefitDiscountValueType,
        }),
      );
      dispatch(
        setCompanionDiscountValue({
          languageId,
          value: prefillData.caregiverValues.benefitDiscountValue,
        }),
      );
      dispatch(
        setCompanionOtherBenefitTypeDescription({
          languageId,
          value: prefillData.caregiverValues.otherBenefitTypeDescription,
        }),
      );
    };

    const applyDetailPrefill = (languageId: CreateBenefitLanguageId) => {
      const localizedValues = prefillData.localizedByLanguage[languageId];

      const detailFieldValues = [
        ['name', localizedValues?.name ?? ''],
        ['description', localizedValues?.description ?? ''],
        ['conditions', localizedValues?.conditions ?? ''],
        ['benefitType', prefillData.beneficiaryValues.benefitType],
        [
          'benefitDiscountValueType',
          prefillData.beneficiaryValues.benefitDiscountValueType,
        ],
        [
          'benefitDiscountValue',
          prefillData.beneficiaryValues.benefitDiscountValue,
        ],
        [
          'otherBenefitTypeDescription',
          prefillData.beneficiaryValues.otherBenefitTypeDescription,
        ],
        ['category', prefillData.category],
      ] as const;

      detailFieldValues.forEach(([field, value]) => {
        dispatch(
          setLocalizedField({
            languageId,
            field,
            value,
          }),
        );
      });

      dispatch(
        setStartDate({
          languageId,
          value: prefillData.startDate,
        }),
      );
      dispatch(
        setHasEndDate({
          languageId,
          value: prefillData.hasEndDate,
        }),
      );
      dispatch(
        setEndDate({
          languageId,
          value: prefillData.endDate,
        }),
      );
      dispatch(
        setBenefitUrl({
          languageId,
          value: prefillData.benefitUrl,
        }),
      );
    };

    AGREEMENT_LANGUAGE_TABS.forEach(({ id: languageId }) => {
      const typedLanguageId = languageId as CreateBenefitLanguageId;
      applyDetailPrefill(typedLanguageId);
      applyCompanionPrefill(typedLanguageId);
    });

    hydratedSourceRef.current = sourceOpportunityId;
  }, [
    availableLocations,
    availableWebsites,
    dispatch,
    isPlacesLoading,
    sourceOpportunityDetail,
    sourceOpportunityId,
  ]);
};

import { useEffect, useRef } from 'react';
import { useGetOpportunityDetailQuery } from '../../../features/opportunities/api';
import { useAppDispatch } from '../../../hooks/store';
import type { CreateBenefitNavigationState } from '../types';
import {
  setField,
  setBenefit,
  setLocalizedValue,
} from '../../../features/opportunityCreation/opportunityCreationSlice';

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

  const {
    beneficiaryBenefit,
    categoryId,
    dateFrom,
    placeIds,
    localizedMetadata,
    url,
    dateTo,
    caregiverBenefit,
  } = sourceOpportunityDetail ?? {};

  useEffect(() => {
    hydratedSourceRef.current = null;
  }, [sourceOpportunityId]);

  useEffect(() => {
    if (!sourceOpportunityId || !sourceOpportunityDetail) {
      return;
    }

    if (hydratedSourceRef.current === sourceOpportunityId) {
      return;
    }

    dispatch(setField({ field: 'dateFrom', value: dateFrom }));
    dispatch(setField({ field: 'dateTo', value: dateTo }));
    dispatch(setField({ field: 'url', value: url }));
    dispatch(setField({ field: 'categoryId', value: categoryId }));
    dispatch(setField({ field: 'placeIds', value: placeIds }));

    localizedMetadata?.map((payload) => dispatch(setLocalizedValue(payload)));

    if (caregiverBenefit) {
      dispatch(
        setBenefit({
          which: 'caregiverBenefit',
          value: caregiverBenefit ?? null,
        }),
      );
    }

    if (beneficiaryBenefit) {
      dispatch(
        setBenefit({
          which: 'beneficiaryBenefit',
          value: beneficiaryBenefit ?? null,
        }),
      );
    }

    hydratedSourceRef.current = sourceOpportunityId;
  }, [
    beneficiaryBenefit,
    caregiverBenefit,
    categoryId,
    dateFrom,
    dateTo,
    dispatch,
    localizedMetadata,
    placeIds,
    sourceOpportunityDetail,
    sourceOpportunityId,
    url,
  ]);
};

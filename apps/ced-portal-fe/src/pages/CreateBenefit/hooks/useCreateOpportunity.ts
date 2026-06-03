import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectOpportunityForm } from '../../../features/opportunityCreation/selectors';
import {
  OpportunityCreationForm,
  resetForm,
} from '../../../features/opportunityCreation/opportunityCreationSlice';
import { OpportunityCreateRequest } from '../../../core/api/generated/model';
import { useCreateOpportunityMutation } from '../../../features/opportunities/api';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../app/routeConfig';
import { useToast } from '../../../contexts';
import { useCallback } from 'react';
import {
  selectSelectedLocationIds,
  selectSelectedWebsiteIds,
} from '../../../features/places/selectors';

const typedObjectEntries = <T extends Record<PropertyKey, unknown>>(
  object: T,
): Array<[keyof T, T[keyof T]]> =>
  Object.entries(object) as Array<[keyof T, T[keyof T]]>;

export const useCreateOpportunity = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [createOpportunity, { isLoading }] = useCreateOpportunityMutation();
  const opportunity: OpportunityCreationForm = useAppSelector(
    selectOpportunityForm,
  );

  const locationsIds = useAppSelector(selectSelectedLocationIds);
  const websiteIds = useAppSelector(selectSelectedWebsiteIds);

  const handleCreation = useCallback(async () => {
    const localizedMetadata = typedObjectEntries(
      opportunity.localizedMetadata,
    ).reduce<OpportunityCreateRequest['localizedMetadata']>(
      (acc, [language, record]) => {
        const entries = typedObjectEntries(record);

        return [
          ...acc,
          ...entries.map(([key, value]) => ({
            key,
            language,
            value,
          })),
        ];
      },
      [],
    );

    const payload: OpportunityCreateRequest = {
      ...opportunity,
      placeIds: [...locationsIds, ...websiteIds],
      localizedMetadata,
    };

    const { error } = await createOpportunity(payload);

    if (!error) {
      showToast('Fatto!', 'success');
      dispatch(resetForm());
    }

    if (error) {
      navigate(APP_ROUTES.HOME);
      showToast('Errore durante la creazione', 'error');
      dispatch(resetForm());
    }
  }, [
    createOpportunity,
    dispatch,
    locationsIds,
    navigate,
    opportunity,
    showToast,
    websiteIds,
  ]);

  return [handleCreation, { isLoading }] as const;
};

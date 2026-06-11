import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectOpportunityForm } from '../../../features/opportunityCreation/selectors';
import {
  OpportunityCreationForm,
  resetForm,
} from '../../../features/opportunityCreation/opportunityCreationSlice';
import { OpportunityCreateRequest } from '../../../core/api/generated/model';
import { useCreateOpportunityMutation } from '../../../features/opportunities/api';
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
  const dispatch = useAppDispatch();

  const [createOpportunity, { isLoading }] = useCreateOpportunityMutation();
  const opportunity: OpportunityCreationForm = useAppSelector(
    selectOpportunityForm,
  );
  console.log('🚀 ~ useCreateOpportunity ~ opportunity:', opportunity);

  const locationsIds = useAppSelector(selectSelectedLocationIds);
  const websiteIds = useAppSelector(selectSelectedWebsiteIds);

  const { showToast } = useToast();

  const handleCreation = useCallback(
    async (options?: { isDraft?: boolean }) => {
      const { isDraft = false } = options ?? {};
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

      try {
        const data = await createOpportunity(payload).unwrap();
        dispatch(resetForm());
        showToast(
          isDraft
            ? 'Bozza salvata con successo'
            : 'Fatto! Opportunità creata con successo',
          'success',
        );
        return data;
      } catch (error) {
        showToast(
          isDraft
            ? 'Errore durante il salvataggio della bozza'
            : "Errore durante la creazione dell'opportunità",
          'error',
        );
        throw error;
      }
    },
    [
      createOpportunity,
      dispatch,
      locationsIds,
      opportunity,
      showToast,
      websiteIds,
    ],
  );

  return [handleCreation, { isLoading }] as const;
};

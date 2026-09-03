import { useAppSelector } from '../../../hooks';
import { selectOpportunityForm } from '../../../features/opportunityCreation/selectors';
import { OpportunityCreationForm } from '../../../features/opportunityCreation/opportunityCreationSlice';
import { OpportunityCreateRequest } from '../../../core/api/generated/model';
import {
  useCreateOpportunityMutation,
  useUpdateOpportunityMutation,
} from '../../../features/opportunities/api';
import { useToast } from '../../../contexts';
import { useCallback } from 'react';
import {
  selectSelectedLocationIds,
  selectSelectedWebsiteIds,
} from '../../../features/places/selectors';
import { hasStatus } from '../../../core/api/baseApi';

type UpsertOptions = {
  isDraft?: boolean;
  sourceOpportunityId?: string | null;
  sourceOpportunityUpdatedAt?: string;
  showSuccessToast?: boolean;
};

const typedObjectEntries = <T extends Record<PropertyKey, unknown>>(
  object: T,
): Array<[keyof T, T[keyof T]]> =>
  Object.entries(object) as Array<[keyof T, T[keyof T]]>;

export const useCreateOpportunity = () => {
  const [createOpportunity, { isLoading }] = useCreateOpportunityMutation();
  const [updateOpportunity, { isLoading: isUpdating }] =
    useUpdateOpportunityMutation();
  const opportunity: OpportunityCreationForm = useAppSelector(
    selectOpportunityForm,
  );

  const locationsIds = useAppSelector(selectSelectedLocationIds);
  const websiteIds = useAppSelector(selectSelectedWebsiteIds);

  const { showToast } = useToast();

  const handleCreation = useCallback(
    async (options?: UpsertOptions) => {
      const {
        isDraft = false,
        sourceOpportunityId,
        sourceOpportunityUpdatedAt,
        showSuccessToast = true,
      } = options ?? {};
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

      const getApiErrorMessage = (error: unknown) => {
        if (hasStatus(error, 409)) {
          return 'È già in corso una modifica dell’opportunità. Riprova più tardi.';
        }

        if (hasStatus(error, 412)) {
          return "L'opportunità non è modificabile in questo stato.";
        }

        if (hasStatus(error, 404)) {
          return 'Opportunità non trovata.';
        }

        return null;
      };

      try {
        if (sourceOpportunityId) {
          if (!sourceOpportunityUpdatedAt) {
            showToast(
              "Errore durante il salvataggio delle modifiche dell'opportunità",
              'error',
            );
            return undefined;
          }

          await updateOpportunity({
            id: sourceOpportunityId,
            payload: {
              ...payload,
              updatedAt: sourceOpportunityUpdatedAt,
            },
          }).unwrap();

          if (showSuccessToast) {
            showToast(
              isDraft
                ? 'Bozza salvata con successo'
                : 'Modifiche salvate con successo',
              'success',
            );
          }

          return { id: sourceOpportunityId };
        }

        const data = await createOpportunity(payload).unwrap();

        if (showSuccessToast) {
          showToast(
            isDraft
              ? 'Bozza salvata con successo'
              : 'Fatto! Opportunità creata con successo',
            'success',
          );
        }

        return data;
      } catch (error) {
        const apiErrorMessage = getApiErrorMessage(error);

        if (apiErrorMessage) {
          showToast(apiErrorMessage, 'error');
          return undefined;
        }

        showToast(
          sourceOpportunityId
            ? isDraft
              ? 'Errore durante il salvataggio della bozza'
              : "Errore durante il salvataggio delle modifiche dell'opportunità"
            : isDraft
              ? 'Errore durante il salvataggio della bozza'
              : "Errore durante la creazione dell'opportunità",
          'error',
        );
        return undefined;
      }
    },
    [
      createOpportunity,
      locationsIds,
      opportunity,
      showToast,
      updateOpportunity,
      websiteIds,
    ],
  );

  return [handleCreation, { isLoading: isLoading || isUpdating }] as const;
};

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

const getSaveSuccessMessage = ({
  isDraft,
  isUpdate,
}: {
  isDraft: boolean;
  isUpdate: boolean;
}) => {
  if (isDraft) {
    return 'Bozza salvata con successo';
  }

  return isUpdate
    ? 'Modifiche salvate con successo'
    : 'Fatto! Opportunità creata con successo';
};

const getSaveErrorMessage = ({
  isDraft,
  isUpdate,
}: {
  isDraft: boolean;
  isUpdate: boolean;
}) => {
  if (isDraft) {
    return 'Errore durante il salvataggio della bozza';
  }

  return isUpdate
    ? "Errore durante il salvataggio delle modifiche dell'opportunità"
    : "Errore durante la creazione dell'opportunità";
};

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
      const isUpdate = Boolean(sourceOpportunityId);
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
        if (!sourceOpportunityId) {
          const data = await createOpportunity(payload).unwrap();

          if (showSuccessToast) {
            showToast(getSaveSuccessMessage({ isDraft, isUpdate }), 'success');
          }

          return data;
        }

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
          showToast(getSaveSuccessMessage({ isDraft, isUpdate }), 'success');
        }

        return { id: sourceOpportunityId };
      } catch (error) {
        const apiErrorMessage = getApiErrorMessage(error);

        showToast(
          apiErrorMessage ?? getSaveErrorMessage({ isDraft, isUpdate }),
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

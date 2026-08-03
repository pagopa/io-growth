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

const OPPORTUNITY_VERSION_CONFLICT = 'OPPORTUNITY_VERSION_CONFLICT';
const OPPORTUNITY_NOT_EDITABLE = 'OPPORTUNITY_NOT_EDITABLE';
const OPPORTUNITY_NOT_FOUND = 'OPPORTUNITY_NOT_FOUND';
const OPPORTUNITY_SOURCE_NOT_READY = 'OPPORTUNITY_SOURCE_NOT_READY';

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

      const getConflictMessage = (error: unknown) => {
        const responseMessage =
          typeof error === 'object' &&
          error !== null &&
          'data' in error &&
          typeof error.data === 'object' &&
          error.data !== null &&
          'message' in error.data &&
          typeof error.data.message === 'string'
            ? error.data.message
            : '';

        return hasStatus(error, 409) || /concurr|version/i.test(responseMessage)
          ? 'È già in corso una modifica dell’opportunità. Riprova più tardi.'
          : null;
      };

      const getNotEditableMessage = (error: unknown) => {
        return hasStatus(error, 412)
          ? "L'opportunità non è modificabile in questo stato."
          : null;
      };

      const getNotFoundMessage = (error: unknown) => {
        return hasStatus(error, 404) ? 'Opportunità non trovata.' : null;
      };

      try {
        if (sourceOpportunityId) {
          if (!sourceOpportunityUpdatedAt) {
            showToast(
              "Errore durante il salvataggio delle modifiche dell'opportunità",
              'error',
            );
            throw new Error(OPPORTUNITY_SOURCE_NOT_READY);
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
        const conflictMessage = getConflictMessage(error);
        const notEditableMessage = getNotEditableMessage(error);
        const notFoundMessage = getNotFoundMessage(error);

        if (conflictMessage) {
          showToast(conflictMessage, 'error');
          throw new Error(OPPORTUNITY_VERSION_CONFLICT);
        }

        if (notEditableMessage) {
          showToast(notEditableMessage, 'error');
          throw new Error(OPPORTUNITY_NOT_EDITABLE);
        }

        if (notFoundMessage) {
          showToast(notFoundMessage, 'error');
          throw new Error(OPPORTUNITY_NOT_FOUND);
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
        throw error;
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

export const OPPORTUNITY_CONFLICT_ERROR = OPPORTUNITY_VERSION_CONFLICT;
export const OPPORTUNITY_NOT_EDITABLE_ERROR = OPPORTUNITY_NOT_EDITABLE;
export const OPPORTUNITY_NOT_FOUND_ERROR = OPPORTUNITY_NOT_FOUND;
export const OPPORTUNITY_SOURCE_NOT_READY_ERROR = OPPORTUNITY_SOURCE_NOT_READY;

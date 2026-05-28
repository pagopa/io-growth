import { useAppSelector } from '../../../hooks';
import { selectOpportunityForm } from '../../../features/opportunityCreation/selectors';
import { OpportunityCreationForm } from '../../../features/opportunityCreation/opportunityCreationSlice';
import { OpportunityCreateRequest } from '../../../core/api/generated/model';
import { useCreateOpportunityMutation } from '../../../features/opportunities/api';

const typedObjectEntries = <T extends Record<PropertyKey, unknown>>(
  object: T,
): Array<[keyof T, T[keyof T]]> =>
  Object.entries(object) as Array<[keyof T, T[keyof T]]>;

export const useCreateOpportunity = () => {
  const [createOpportunity] = useCreateOpportunityMutation();
  const opportunity: OpportunityCreationForm = useAppSelector(
    selectOpportunityForm,
  );

  const handleCreation = async () => {
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
      placeIds: ['01KSQ7Y68BSCB5N60T9ZCBSM80'],
      localizedMetadata,
      // dateFrom:
      // dateTo:
    };

    await createOpportunity(payload);
  };

  return handleCreation;
};

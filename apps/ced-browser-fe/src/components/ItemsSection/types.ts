import {
  PlaceDetailOpportunity,
  PlaceDetailRelatedItem,
} from '../../generated/model';
import { EntityOpportunity } from '../../features/entities/types';

type BaseItemsSectionProps<TVariant, TItems> = {
  variant: TVariant;
  entityId: string;
  items: TItems[];
  sectionLabel?: string;
};
export type ItemsSectionProps =
  | (BaseItemsSectionProps<
      'opportunity',
      PlaceDetailOpportunity | EntityOpportunity
    > & {
      hideEyebrow?: boolean;
    })
  | BaseItemsSectionProps<'access-point', PlaceDetailRelatedItem>;

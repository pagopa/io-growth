import {
  AccessPointDetailOpportunity,
  AccessPointDetailRelatedItem,
} from '../../core/api/generated/model';

type BaseItemsSectionProps<TVariant, TItems> = {
  variant: TVariant;
  entityId: string;
  items: TItems[];
  sectionLabel?: string;
};
export type ItemsSectionProps =
  | (BaseItemsSectionProps<'opportunity', AccessPointDetailOpportunity> & {
      hideEyebrow?: boolean;
    })
  | BaseItemsSectionProps<'access-point', AccessPointDetailRelatedItem>;

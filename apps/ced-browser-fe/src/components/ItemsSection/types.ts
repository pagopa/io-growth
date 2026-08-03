import { PlaceDetailRelatedItem } from '../../core/api/generated/model';
import { EntityOpportunity } from '../../features/entities/types';

type TrackingExtraProperties = {
  organization_name?: string;
  organization_fiscal_code?: string;
  location_name?: string;
};

type BaseItemsSectionProps<TVariant, TItems> = {
  variant: TVariant;
  entityId: string;
  items: TItems[];
  sectionLabel?: string;
};

export type PlaceDetailItems = PlaceDetailRelatedItem & TrackingExtraProperties;
export type EntityOpportunityItems = EntityOpportunity &
  TrackingExtraProperties;

export type ItemsSectionProps =
  | (BaseItemsSectionProps<
      'opportunity',
      PlaceDetailItems | EntityOpportunityItems
    > & {
      hideEyebrow?: boolean;
    })
  | BaseItemsSectionProps<
      'access-point',
      PlaceDetailRelatedItem & TrackingExtraProperties
    >;

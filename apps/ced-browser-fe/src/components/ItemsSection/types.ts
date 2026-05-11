import type {
  EntityAccessPoint,
  EntityOpportunity,
} from '../../features/entities/types.js';

type BaseItemsSectionProps<TVariant, TItems> = {
  variant: TVariant;
  entityId: string;
  items: TItems[];
  sectionLabel?: string;
};
export type ItemsSectionProps =
  | (BaseItemsSectionProps<'opportunity', EntityOpportunity> & {
      hideEyebrow?: boolean;
    })
  | BaseItemsSectionProps<'access-point', EntityAccessPoint>;

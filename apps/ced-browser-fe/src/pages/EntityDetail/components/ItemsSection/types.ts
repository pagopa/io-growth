import type {
  EntityAccessPoint,
  EntityOpportunity,
} from '../../../../features/entities/types.js';

export type ItemsSectionProps =
  | { variant: 'opportunity'; entityId: string; items: EntityOpportunity[] }
  | { variant: 'access-point'; entityId: string; items: EntityAccessPoint[] };

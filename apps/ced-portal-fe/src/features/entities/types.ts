export type EntityRequestState = 'Da_gestire' | 'Rifiutata';

export type ManagedEntityState = 'Attivo' | 'Inattivo' | 'Cessato';

export type EntityState = EntityRequestState | ManagedEntityState;

export interface BaseEntityItem {
  id: string;
  name: string;
  city: string;
}

export interface EntityRequestItem extends BaseEntityItem {
  tab: 'requests';
  created_at: string;
  state: EntityRequestState;
}

export interface ManagedEntityItem extends BaseEntityItem {
  tab: 'entities';
  opportunities_count: number;
  active_from: string;
  state: ManagedEntityState;
}

export type EntityItem = EntityRequestItem | ManagedEntityItem;

export type EntitiesResponse = EntityItem[];

export interface EntityFilters {
  search: string;
  state: string;
}

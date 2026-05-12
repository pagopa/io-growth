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

export interface EntityGeographicInfo {
  competence_area: string;
  areas: string[];
}

export interface EntityLegalRepresentative {
  full_name: string;
  email: string;
  phone: string;
}

export interface EntityConventionFile {
  name: string;
  url: string;
}

export interface EntityConvention {
  request_file: EntityConventionFile;
  upload_hint: string;
  upload_format_hint: string;
  mandatory_hint: string;
}

export interface EntityDetail {
  id: string;
  name: string;
  state: EntityState;
  product: string;
  adherent_type: string;
  business_name: string;
  legal_headquarters: string;
  cap: string;
  pec_email: string;
  vat_number: string;
  is_group_vat: string;
  sdi_code: string;
  business_registry_place: string;
  rea: string;
  public_email: string;
  geographic: EntityGeographicInfo;
  legal_representative: EntityLegalRepresentative;
  convention: EntityConvention;
}

export interface EntityFilters {
  search: string;
  state: string;
}

export type EntityOpportunity = {
  id: string;
  eyebrow?: string;
  title: string;
  badgeLabel: string;
};

export type EntityAccessPoint = {
  id: string;
  title: string;
  subtitle: string;
};

export type EntityContacts = {
  phone?: string;
  website?: string;
  address?: string;
  privacyUrl?: string;
  termsUrl?: string;
};

export type EntityDetail = {
  id: string;
  name: string;
  opportunities: EntityOpportunity[];
  accessPoints: EntityAccessPoint[];
  contacts: EntityContacts;
};

export type AccessPointDetail = {
  id: string;
  title: string;
  entityId: string;
  entityName: string;
  opportunities: EntityOpportunity[];
  contacts: EntityContacts;
  relatedAccessPoints: EntityAccessPoint[];
};

export type OpportunityCompanion = {
  enabled: boolean;
  discount_type: string;
  discount_value: number;
};

export type OpportunityDetail = {
  id: string;
  name: string;
  organization_name: string;
  entityId: string;
  accessPointId: string;
  state: string;
  opportunity_type: string;
  discount_type?: string;
  discount_value?: number;
  discount_label?: string;
  description: string;
  category: string;
  validity_start: string;
  validity_end: string;
  conditions: string;
  info_url?: string;
  venue_name?: string;
  venue_address?: string;
  managed_by?: string;
  companion?: OpportunityCompanion;
};

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

export type EntitySearchItem = {
  id: string;
  name: string;
  address: string;
};

export type EntitySearchResponse = {
  total: number;
  items: EntitySearchItem[];
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

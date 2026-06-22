export type {
  PlaceSearchResponse,
  PlaceSearchItem,
  PlaceAddress,
  PlaceDetail,
  PlaceDetailContacts,
  PlaceDetailOpportunity,
  PlaceDetailRelatedItem,
  OpportunityDetail,
} from '../../core/api/generated/model/index.js';

// Legacy alias kept for components that reference EntitySearchItem / EntitySearchResponse
export type { PlaceSearchItem as EntitySearchItem } from '../../core/api/generated/model/index.js';
export type { PlaceSearchResponse as EntitySearchResponse } from '../../core/api/generated/model/index.js';
export type { PlaceDetail as AccessPointDetail } from '../../core/api/generated/model/index.js';

// FE-specific types — no generated equivalent (entity detail has no dedicated BE endpoint yet)
export type EntityOpportunity = {
  id: string;
  eyebrow?: string;
  title: string;
  badgeLabel: string;
};

type EntityAccessPoint = {
  id: string;
  title: string;
  subtitle: string;
};

type EntityContacts = {
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

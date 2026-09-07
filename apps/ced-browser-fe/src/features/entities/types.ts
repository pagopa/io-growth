// Legacy alias kept for components that reference EntitySearchItem / EntitySearchResponse
// FE-specific types — no generated equivalent (entity detail has no dedicated BE endpoint yet)
export type EntityOpportunity = {
  id: string;
  eyebrow?: string;
  title: string;
  badgeLabel: string;
};

export type EntityContacts = {
  phone?: string;
  website?: string;
  address?: string;
  privacyUrl?: string;
  termsUrl?: string;
};

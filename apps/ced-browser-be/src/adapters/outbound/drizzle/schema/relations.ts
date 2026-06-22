import { relations } from "drizzle-orm";

import {
  address,
  beneficiaryBenefit,
  caregiverBenefit,
  localizedMetadata,
  operator,
  opportunity,
  opportunityCategory,
  opportunityPlace,
  place,
  profile,
  supportContact,
  website,
} from "./tables.js";

export const operatorRelations = relations(operator, ({ many, one }) => ({
  opportunities: many(opportunity),
  places: many(place),
  profile: one(profile),
}));

export const placeRelations = relations(place, ({ many, one }) => ({
  address: one(address),
  operator: one(operator, {
    fields: [place.operatorId],
    references: [operator.id],
  }),
  opportunityPlaces: many(opportunityPlace),
  profile: one(profile),
  supportContacts: many(supportContact),
  website: one(website),
}));

export const profileRelations = relations(profile, ({ one }) => ({
  operator: one(operator, {
    fields: [profile.operatorId],
    references: [operator.id],
  }),
  place: one(place, {
    fields: [profile.placeId],
    references: [place.id],
  }),
}));

export const addressRelations = relations(address, ({ one }) => ({
  place: one(place, {
    fields: [address.placeId],
    references: [place.id],
  }),
}));

export const websiteRelations = relations(website, ({ one }) => ({
  place: one(place, {
    fields: [website.placeId],
    references: [place.id],
  }),
}));

export const supportContactRelations = relations(supportContact, ({ one }) => ({
  place: one(place, {
    fields: [supportContact.placeId],
    references: [place.id],
  }),
}));

export const opportunityRelations = relations(opportunity, ({ many, one }) => ({
  beneficiaryBenefit: one(beneficiaryBenefit),
  caregiverBenefit: one(caregiverBenefit),
  category: one(opportunityCategory, {
    fields: [opportunity.categoryId],
    references: [opportunityCategory.id],
  }),
  localizedMetadata: many(localizedMetadata),
  operator: one(operator, {
    fields: [opportunity.operatorId],
    references: [operator.id],
  }),
  opportunityPlaces: many(opportunityPlace),
}));

export const opportunityCategoryRelations = relations(
  opportunityCategory,
  ({ many }) => ({
    opportunities: many(opportunity),
  }),
);

export const opportunityPlaceRelations = relations(
  opportunityPlace,
  ({ one }) => ({
    opportunity: one(opportunity, {
      fields: [opportunityPlace.opportunityId],
      references: [opportunity.id],
    }),
    place: one(place, {
      fields: [opportunityPlace.placeId],
      references: [place.id],
    }),
  }),
);

export const beneficiaryBenefitRelations = relations(
  beneficiaryBenefit,
  ({ one }) => ({
    opportunity: one(opportunity, {
      fields: [beneficiaryBenefit.opportunityId],
      references: [opportunity.id],
    }),
  }),
);

export const caregiverBenefitRelations = relations(
  caregiverBenefit,
  ({ one }) => ({
    opportunity: one(opportunity, {
      fields: [caregiverBenefit.opportunityId],
      references: [opportunity.id],
    }),
  }),
);

export const localizedMetadataRelations = relations(
  localizedMetadata,
  ({ one }) => ({
    opportunity: one(opportunity, {
      fields: [localizedMetadata.opportunityId],
      references: [opportunity.id],
    }),
  }),
);

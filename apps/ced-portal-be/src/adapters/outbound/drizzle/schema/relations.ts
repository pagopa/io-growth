import { relations } from "drizzle-orm";

import {
  address,
  operator,
  place,
  profile,
  supportContact,
  website,
} from "./tables.js";

export const operatorRelations = relations(operator, ({ many, one }) => ({
  places: many(place),
  profile: one(profile),
}));

export const placeRelations = relations(place, ({ many, one }) => ({
  address: one(address),
  operator: one(operator, {
    fields: [place.operatorId],
    references: [operator.id],
  }),
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

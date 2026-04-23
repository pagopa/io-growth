import {
  date,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  benefitTypeEnum,
  changeAuditChangeTypeEnum,
  changeAuditEntityTypeEnum,
  localizedMetadataKeyEnum,
  localizedMetadataLanguageEnum,
  operatorStatusEnum,
  opportunityStatusEnum,
  placeTypeEnum,
  supportContactTypeEnum,
} from "./enums.js";

export const operator = pgTable("operator", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  externalId: uuid("external_id").notNull(),
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  status: operatorStatusEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const place = pgTable("place", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operator.id),
  type: placeTypeEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const profile = pgTable("profile", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  displayName: text("display_name").notNull(),
  id: uuid().primaryKey().defaultRandom(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operator.id)
    .unique(),
  placeId: uuid("place_id")
    .notNull()
    .references(() => place.id),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const website = pgTable("website", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: uuid().primaryKey().defaultRandom(),
  placeId: uuid("place_id")
    .notNull()
    .references(() => place.id)
    .unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  url: text().notNull(),
});

export const address = pgTable("address", {
  city: text().notNull(),
  country: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: uuid().primaryKey().defaultRandom(),
  placeId: uuid("place_id")
    .notNull()
    .references(() => place.id)
    .unique(),
  postalCode: text("postal_code").notNull(),
  state: text().notNull(),
  street: text().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const supportContact = pgTable("support_contact", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: uuid().primaryKey().defaultRandom(),
  placeId: uuid("place_id")
    .notNull()
    .references(() => place.id),
  type: supportContactTypeEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  value: text().notNull(),
});

export const opportunity = pgTable("opportunity", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dateFrom: date("date_from").notNull(),
  dateTo: date("date_to"),
  id: uuid().primaryKey().defaultRandom(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operator.id),
  status: opportunityStatusEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  url: text(),
});

export const opportunityPlace = pgTable(
  "opportunity_place",
  {
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunity.id),
    placeId: uuid("place_id")
      .notNull()
      .references(() => place.id),
  },
  (table) => [primaryKey({ columns: [table.opportunityId, table.placeId] })],
);

export const beneficiaryBenefit = pgTable("beneficiary_benefit", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: uuid().primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id")
    .notNull()
    .references(() => opportunity.id)
    .unique(),
  type: benefitTypeEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  value: integer().notNull(),
});

export const caregiverBenefit = pgTable("caregiver_benefit", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: uuid().primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id")
    .notNull()
    .references(() => opportunity.id)
    .unique(),
  type: benefitTypeEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  value: integer().notNull(),
});

export const localizedMetadata = pgTable("localized_metadata", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: uuid().primaryKey().defaultRandom(),
  key: localizedMetadataKeyEnum().notNull(),
  language: localizedMetadataLanguageEnum().notNull(),
  opportunityId: uuid("opportunity_id")
    .notNull()
    .references(() => opportunity.id),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  value: text().notNull(),
});

export const changeAudit = pgTable("change_audit", {
  changeType: changeAuditChangeTypeEnum("change_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  entityId: uuid("entity_id").notNull(),
  entityType: changeAuditEntityTypeEnum("entity_type").notNull(),
  id: uuid().primaryKey().defaultRandom(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operator.id),
  referentExternalId: text("referent_external_id").notNull(),
  referentFullname: text("referent_fullname").notNull(),
  value: jsonb().notNull(),
});

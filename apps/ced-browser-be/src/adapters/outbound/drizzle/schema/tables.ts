import {
  boolean,
  char,
  customType,
  integer,
  pgMaterializedView,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  benefitDiscountTypeEnum,
  benefitTypeEnum,
  localizedMetadataLanguageEnum,
  operatorStatusEnum,
  placeTypeEnum,
  supportContactTypeEnum,
} from "./enums.js";

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });

export const placeMaterializedView = pgMaterializedView(
  "place_materialized_view",
  {
    city: varchar({ length: 255 }),
    country: varchar({ length: 255 }),
    id: char({ length: 26 }).notNull(),
    name: varchar({ length: 512 }),
    operatorId: char("operator_id", { length: 26 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }),
    profileDisplayName: varchar("profile_display_name", { length: 512 }),
    profileId: char("profile_id", { length: 26 }),
    searchVectorCity: tsvector("search_vector_city"),
    searchVectorDisplayName: tsvector("search_vector_display_name"),
    searchVectorName: tsvector("search_vector_name"),
    state: varchar({ length: 255 }),
    street: varchar({ length: 512 }),
    type: placeTypeEnum(),
    url: varchar({ length: 2048 }),
  },
).existing();

export const operator = pgTable("operator", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  externalId: uuid("external_id").notNull(),
  id: char({ length: 26 }).primaryKey(),
  name: varchar({ length: 512 }).notNull(),
  status: operatorStatusEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const place = pgTable("place", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: char({ length: 26 }).primaryKey(),
  name: varchar({ length: 512 }).notNull(),
  operatorId: char("operator_id", { length: 26 })
    .notNull()
    .references(() => operator.id, { onDelete: "cascade" }),
  type: placeTypeEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const profile = pgTable("profile", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  displayName: varchar("display_name", { length: 512 }).notNull(),
  id: char({ length: 26 }).primaryKey(),
  operatorId: char("operator_id", { length: 26 })
    .notNull()
    .references(() => operator.id, { onDelete: "cascade" })
    .unique(),
  placeId: char("place_id", { length: 26 })
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
  id: char({ length: 26 }).primaryKey(),
  placeId: char("place_id", { length: 26 })
    .notNull()
    .references(() => place.id, { onDelete: "cascade" })
    .unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  url: varchar({ length: 2048 }).notNull(),
});

export const address = pgTable("address", {
  city: varchar({ length: 64 }).notNull(),
  country: varchar({ length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: char({ length: 26 }).primaryKey(),
  placeId: char("place_id", { length: 26 })
    .notNull()
    .references(() => place.id, { onDelete: "cascade" })
    .unique(),
  postalCode: varchar("postal_code", { length: 64 }).notNull(),
  state: varchar({ length: 64 }).notNull(),
  street: varchar({ length: 512 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const supportContact = pgTable("support_contact", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: char({ length: 26 }).primaryKey(),
  placeId: char("place_id", { length: 26 })
    .notNull()
    .references(() => place.id, { onDelete: "cascade" }),
  type: supportContactTypeEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  value: varchar({ length: 2048 }).notNull(),
});

export const opportunityMaterializedView = pgMaterializedView(
  "opportunity_materialized_view",
  {
    beneficiaryBenefitDiscountType: benefitDiscountTypeEnum(
      "beneficiary_benefit_discount_type",
    ),
    beneficiaryBenefitType: benefitTypeEnum(
      "beneficiary_benefit_type",
    ).notNull(),
    beneficiaryBenefitValue: integer("beneficiary_benefit_value"),
    id: char({ length: 26 }).notNull(),
    language: localizedMetadataLanguageEnum(),
    name: varchar({ length: 512 }),
    nationalTerritory: boolean("national_territory"),
    operatorId: char("operator_id", { length: 26 }),
    placeId: char("place_id", { length: 26 }),
    profileDisplayName: varchar("profile_display_name", { length: 512 }),
  },
).existing();

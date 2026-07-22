import {
  boolean,
  char,
  customType,
  date,
  integer,
  jsonb,
  pgMaterializedView,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import {
  actorTypeEnum,
  benefitDiscountTypeEnum,
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

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });

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
  id: char({ length: 26 })
    .primaryKey()
    .$defaultFn(() => ulid()),
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
  id: char({ length: 26 })
    .primaryKey()
    .$defaultFn(() => ulid()),
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
  id: char({ length: 26 })
    .primaryKey()
    .$defaultFn(() => ulid()),
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

export const opportunityCategory = pgTable("opportunity_category", {
  description: varchar({ length: 512 }).notNull(),
  id: char({ length: 26 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  title: varchar({ length: 64 }).notNull(),
});

export const opportunity = pgTable("opportunity", {
  categoryId: char("category_id", { length: 26 })
    .notNull()
    .references(() => opportunityCategory.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dateFrom: date("date_from").notNull(),
  dateTo: date("date_to"),
  deletionMessage: varchar("deletion_message", { length: 4096 }),
  id: char({ length: 26 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  nationalTerritory: boolean("national_territory").notNull().default(false),
  operatorId: char("operator_id", { length: 26 })
    .notNull()
    .references(() => operator.id, { onDelete: "cascade" }),
  rejectionMessage: varchar("rejection_message", { length: 4096 }),
  status: opportunityStatusEnum().notNull(),
  suspendedBy: actorTypeEnum("suspended_by"),
  suspendFrom: date("suspend_from"),
  suspensionMessage: varchar("suspension_message", { length: 4096 }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  url: varchar({ length: 2048 }),
});

export const opportunityPlace = pgTable(
  "opportunity_place",
  {
    opportunityId: char("opportunity_id", { length: 26 })
      .notNull()
      .references(() => opportunity.id, { onDelete: "cascade" }),
    placeId: char("place_id", { length: 26 })
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.opportunityId, table.placeId] })],
);

export const beneficiaryBenefit = pgTable("beneficiary_benefit", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  description: varchar({ length: 4096 }),
  discountType: benefitDiscountTypeEnum("discount_type"),
  id: char({ length: 26 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  opportunityId: char("opportunity_id", { length: 26 })
    .notNull()
    .references(() => opportunity.id, { onDelete: "cascade" })
    .unique(),
  type: benefitTypeEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  value: integer(),
});

export const caregiverBenefit = pgTable("caregiver_benefit", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  description: varchar({ length: 4096 }),
  discountType: benefitDiscountTypeEnum("discount_type"),
  id: char({ length: 26 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  opportunityId: char("opportunity_id", { length: 26 })
    .notNull()
    .references(() => opportunity.id, { onDelete: "cascade" })
    .unique(),
  type: benefitTypeEnum().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  value: integer(),
});

export const localizedMetadata = pgTable("localized_metadata", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: char({ length: 26 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  key: localizedMetadataKeyEnum().notNull(),
  language: localizedMetadataLanguageEnum().notNull(),
  opportunityId: char("opportunity_id", { length: 26 })
    .notNull()
    .references(() => opportunity.id, { onDelete: "cascade" }),
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
  entityId: char("entity_id", { length: 26 }).notNull(),
  entityType: changeAuditEntityTypeEnum("entity_type").notNull(),
  id: char({ length: 26 })
    .primaryKey()
    .$defaultFn(() => ulid()),
  operatorId: char("operator_id", { length: 26 })
    .notNull()
    .references(() => operator.id),
  referentExternalId: varchar("referent_external_id", {
    length: 512,
  }).notNull(),
  referentFullname: varchar("referent_fullname", { length: 512 }).notNull(),
  value: jsonb().notNull(),
});

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

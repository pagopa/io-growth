import { pgEnum } from "drizzle-orm/pg-core";

export const operatorStatusEnum = pgEnum("operator_status", [
  "active",
  "suspended",
  "revoked",
]);

export const placeTypeEnum = pgEnum("place_type", ["online", "offline"]);

export const supportContactTypeEnum = pgEnum("support_contact_type", [
  "email",
  "phone",
  "website",
]);

export const opportunityStatusEnum = pgEnum("opportunity_status", [
  "draft",
  "test_pending",
  "test_rejected",
  "test_passed",
  "published",
  "suspended",
  "deleted",
]);

export const benefitTypeEnum = pgEnum("benefit_type", [
  "free",
  "reduced_fixed_price",
  "priority",
  "discount",
  "other",
]);

export const benefitDiscountTypeEnum = pgEnum("benefit_discount_type", [
  "percentage",
  "fixed_amount",
]);

export const localizedMetadataKeyEnum = pgEnum("localized_metadata_key", [
  "name",
  "description",
  "condition",
]);

export const localizedMetadataLanguageEnum = pgEnum(
  "localized_metadata_language",
  ["en", "fr", "de", "sl", "it"],
);

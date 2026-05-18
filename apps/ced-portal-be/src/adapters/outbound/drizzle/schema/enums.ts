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
  "approval_pending",
  "test_pending",
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

export const changeAuditEntityTypeEnum = pgEnum("change_audit_entity_type", [
  "opportunity",
  "place",
  "support_contact",
  "profile",
  "address",
  "website",
  "beneficiary_benefit",
  "caregiver_benefit",
  "localized_metadata",
  "opportunity_category",
]);

export const changeAuditChangeTypeEnum = pgEnum("change_audit_change_type", [
  "create",
  "update",
]);

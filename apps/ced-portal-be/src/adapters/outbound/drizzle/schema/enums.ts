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
  "test_passed",
  "published",
  "suspended",
  "deleted",
]);

export const benefitTypeEnum = pgEnum("benefit_type", [
  "percentual",
  "absolute",
]);

export const localizedMetadataKeyEnum = pgEnum("localized_metadata_key", [
  "name",
  "description",
  "condition",
  "type",
  "category",
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
]);

export const changeAuditChangeTypeEnum = pgEnum("change_audit_change_type", [
  "create",
  "update",
]);

import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type {
  BenefitSummary,
  OpportunityDetail,
  OpportunitySummary,
} from "../../../domain/entities/opportunity.js";

export interface BenefitRow {
  readonly description: null | string;
  readonly discountType: "fixed_amount" | "percentage" | null;
  readonly type:
    | "discount"
    | "free"
    | "other"
    | "priority"
    | "reduced_fixed_price";
  readonly value: null | number;
}

export interface OpportunityDetailRow {
  readonly beneficiaryBenefit: BenefitRow | null;
  readonly caregiverBenefit: BenefitRow | null;
  readonly category: null | { readonly title: string };
  readonly categoryId: string;
  readonly createdAt: Date;
  readonly dateFrom: string;
  readonly dateTo: null | string;
  readonly id: string;
  readonly localizedMetadata: readonly {
    readonly key: "condition" | "description" | "name";
    readonly language: "de" | "en" | "fr" | "it" | "sl";
    readonly value: string;
  }[];
  readonly opportunityPlaces: readonly { readonly placeId: string }[];
  readonly status: OpportunitySummary["status"];
  readonly updatedAt: Date;
  readonly url: null | string;
}

export interface OpportunitySummaryRow {
  readonly categoryTitle: string;
  readonly dateFrom: string;
  readonly dateTo: null | string;
  readonly id: string;
  readonly name: null | string;
  readonly status: OpportunitySummary["status"];
}

const mapBenefitRow = (row: BenefitRow): BenefitSummary | null => {
  switch (row.type) {
    case "discount":
      if (row.value === null || row.discountType === null) {
        return null;
      }
      return {
        discountType: row.discountType,
        type: row.type,
        value: row.value,
      };
    case "free":
      return { type: row.type };
    case "other":
      if (row.description === null) {
        return null;
      }
      return { description: row.description, type: row.type };
    case "priority":
      return { type: row.type };
    case "reduced_fixed_price":
      if (row.value === null) {
        return null;
      }
      return { type: row.type, value: row.value };
    default:
      return null;
  }
};

export const mapOpportunityDetailRow = (
  row: OpportunityDetailRow,
): Result<OpportunityDetail, GenericError> => {
  const beneficiaryBenefit = row.beneficiaryBenefit
    ? mapBenefitRow(row.beneficiaryBenefit)
    : null;

  if (!beneficiaryBenefit) {
    return err(
      new GenericError(
        `Data integrity error: opportunity ${row.id} has invalid beneficiary benefit`,
      ),
    );
  }

  const caregiverBenefit = row.caregiverBenefit
    ? mapBenefitRow(row.caregiverBenefit)
    : null;

  if (row.caregiverBenefit && !caregiverBenefit) {
    return err(
      new GenericError(
        `Data integrity error: opportunity ${row.id} has invalid caregiver benefit`,
      ),
    );
  }

  if (!row.category) {
    return err(
      new GenericError(
        `Data integrity error: opportunity ${row.id} references a missing category`,
      ),
    );
  }

  return ok({
    beneficiaryBenefit,
    caregiverBenefit,
    categoryId: row.categoryId,
    categoryTitle: row.category.title,
    createdAt: row.createdAt.toISOString(),
    dateFrom: row.dateFrom,
    dateTo: row.dateTo,
    id: row.id,
    localizedMetadata: row.localizedMetadata.map((lm) => ({
      key: lm.key,
      language: lm.language,
      value: lm.value,
    })),
    placeIds: row.opportunityPlaces.map((op) => op.placeId),
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
    url: row.url,
  });
};

export const mapOpportunitySummaryRow = (
  row: OpportunitySummaryRow,
): OpportunitySummary => ({
  categoryTitle: row.categoryTitle,
  dateFrom: row.dateFrom,
  dateTo: row.dateTo,
  id: row.id,
  name: row.name ?? "",
  status: row.status,
});

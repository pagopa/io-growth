import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { OpportunityDetail } from "../../../entities/opportunity.js";
import type { Language } from "./place.repository.js";

export const BENEFIT_TYPE_VALUES = [
  "free",
  "reduced_fixed_price",
  "priority",
  "discount",
  "other",
] as const;
export type BenefitType = (typeof BENEFIT_TYPE_VALUES)[number];

export const BENEFIT_DISCOUNT_TYPE_VALUES = [
  "percentage",
  "fixed_amount",
] as const;
export type BenefitDiscountType = (typeof BENEFIT_DISCOUNT_TYPE_VALUES)[number];

export const OPPORTUNITY_ORDER_BY_VALUES = [
  "dateFrom",
  "dateTo",
  "name",
  "profileDisplayName",
] as const;
export type OpportunityOrderBy = (typeof OPPORTUNITY_ORDER_BY_VALUES)[number];

export const OPPORTUNITY_ORDER_DIRECTION_VALUES = ["asc", "desc"] as const;
export interface FindPublishedOpportunityByIdInput {
  language: Language;
  opportunityId: string;
}

export type OpportunityOrderDirection =
  (typeof OPPORTUNITY_ORDER_DIRECTION_VALUES)[number];

export interface OpportunityRepository {
  readonly findPublishedById: (
    input: FindPublishedOpportunityByIdInput,
  ) => Promise<Result<OpportunityDetail | undefined, GenericError>>;
  readonly searchFromMaterializedView: (
    input: SearchOpportunitiesInput,
  ) => Promise<Result<SearchOpportunitiesResult, GenericError>>;
}

export interface OpportunitySearchItem {
  beneficiaryBenefitDiscountType: BenefitDiscountType | null;
  beneficiaryBenefitType: BenefitType;
  beneficiaryBenefitValue: null | number;
  dateFrom?: string;
  dateTo?: null | string;
  id: string;
  language?: Language;
  name: string;
  profileDisplayName: string;
}

export interface SearchOpportunitiesInput {
  language: Language;
  limit: number;
  offset: number;
  orderBy: OpportunityOrderBy;
  orderDirection: OpportunityOrderDirection;
}

export interface SearchOpportunitiesResult {
  items: OpportunitySearchItem[];
  total: number;
}

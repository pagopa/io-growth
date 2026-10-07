import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";

import { and, eq } from "drizzle-orm";

import {
  ACTOR_TYPE,
  type Benefit,
  type Opportunity,
  OPPORTUNITY_STATUS,
} from "../../../domain/entities/opportunity.js";
import * as schema from "./schema/index.js";
import {
  beneficiaryBenefit,
  caregiverBenefit,
  localizedMetadata,
  opportunity,
  opportunityPlace,
} from "./schema/tables.js";
type TransactionClient = Parameters<
  Parameters<TypedDbClient<typeof schema>["transaction"]>[0]
>[0];

const mapBenefitToRow = (benefit: Benefit, opportunityId: string) => {
  const base = { id: benefit.id, opportunityId, type: benefit.type };
  switch (benefit.type) {
    case "discount":
      return {
        ...base,
        discountType: benefit.discountType,
        value: benefit.value,
      };
    case "other":
      return { ...base, description: benefit.description };
    case "reduced_fixed_price":
      return { ...base, value: benefit.value };
    default:
      return base;
  }
};

/**
 * Creates an opportunity with its related entities (benefits, metadata, place links)
 * inside an existing transaction using the application-provided IDs.
 */
export const createOpportunityInTransaction = async (
  tx: TransactionClient,
  operatorId: string,
  input: Opportunity,
): Promise<void> => {
  await tx.insert(opportunity).values({
    categoryId: input.categoryId,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    id: input.id,
    nationalTerritory: input.nationalTerritory,
    operatorId,
    status: input.status,
    url: input.url,
  });

  if (input.placeIds.length > 0) {
    await tx.insert(opportunityPlace).values(
      input.placeIds.map((placeId) => ({
        opportunityId: input.id,
        placeId,
      })),
    );
  }

  await tx
    .insert(beneficiaryBenefit)
    .values(mapBenefitToRow(input.beneficiaryBenefit, input.id));

  if (input.caregiverBenefit) {
    await tx
      .insert(caregiverBenefit)
      .values(mapBenefitToRow(input.caregiverBenefit, input.id));
  }

  if (input.localizedMetadata.length > 0) {
    await tx.insert(localizedMetadata).values(
      input.localizedMetadata.map((lm) => ({
        id: lm.id,
        key: lm.key,
        language: lm.language,
        opportunityId: input.id,
        value: lm.value,
      })),
    );
  }
};

/**
 * Suspends every published opportunity of an operator inside an existing
 * transaction, as the cascade of a contract revocation.
 *
 * Returns the number of affected rows. Zero is a legitimate outcome.
 */
export const suspendAllOpportunitiesByOperatorIdInTransaction = async (
  tx: TransactionClient,
  operatorId: string,
  suspensionMessage: string,
): Promise<number> => {
  const result = await tx
    .update(opportunity)
    .set({
      status: OPPORTUNITY_STATUS.SUSPENDED,
      suspendedBy: ACTOR_TYPE.DEPARTMENT,
      suspendFrom: null,
      suspensionMessage,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(opportunity.operatorId, operatorId),
        eq(opportunity.status, OPPORTUNITY_STATUS.PUBLISHED),
      ),
    );

  return result.count;
};

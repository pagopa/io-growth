import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { err, ok } from "neverthrow";

import type {
  BenefitType,
  FindPublishedOpportunityByIdInput,
  OpportunityRepository,
  OpportunitySearchItem,
  SearchOpportunitiesInput,
  SearchOpportunitiesResult,
} from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import { mapOpportunityDetailRow } from "./opportunity-detail-row.mapper.js";
import * as schema from "./schema/index.js";
import { opportunity, opportunityMaterializedView } from "./schema/tables.js";

const orderByColumn = {
  dateFrom: opportunityMaterializedView.dateFrom,
  dateTo: opportunityMaterializedView.dateTo,
  name: opportunityMaterializedView.name,
  profileDisplayName: opportunityMaterializedView.profileDisplayName,
};

export const createDrizzleOpportunityRepository = (
  db: TypedDbClient<typeof schema>,
): OpportunityRepository => ({
  findPublishedById: async ({
    language,
    opportunityId,
  }: FindPublishedOpportunityByIdInput) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const row = await db.query.opportunity.findFirst({
        columns: {
          dateFrom: true,
          dateTo: true,
          id: true,
          nationalTerritory: true,
          url: true,
        },
        where: and(
          eq(opportunity.id, opportunityId),
          eq(opportunity.status, "published"),
          lte(opportunity.dateFrom, today),
          or(isNull(opportunity.dateTo), gte(opportunity.dateTo, today)),
        ),
        with: {
          beneficiaryBenefit: {
            columns: {
              discountType: true,
              type: true,
              value: true,
            },
          },
          caregiverBenefit: {
            columns: {
              discountType: true,
              type: true,
              value: true,
            },
          },
          category: { columns: { title: true } },
          localizedMetadata: {
            columns: {
              key: true,
              language: true,
              value: true,
            },
          },
          operator: {
            columns: {},
            with: {
              profile: {
                columns: {
                  displayName: true,
                  id: true,
                },
                with: {
                  place: {
                    columns: {
                      id: true,
                      name: true,
                      type: true,
                    },
                    with: {
                      address: {
                        columns: {
                          city: true,
                          postalCode: true,
                          state: true,
                          street: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          opportunityPlaces: {
            columns: {},
            with: {
              place: {
                columns: {
                  id: true,
                  name: true,
                  type: true,
                },
                with: {
                  address: {
                    columns: {
                      city: true,
                      country: true,
                      postalCode: true,
                      state: true,
                      street: true,
                    },
                  },
                  website: {
                    columns: {
                      url: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!row) {
        return ok(undefined);
      }

      return mapOpportunityDetailRow(row, language);
    } catch (error) {
      return err(
        new GenericError(`Failed to get opportunity detail: ${String(error)}`),
      );
    }
  },

  searchFromMaterializedView: async ({
    language,
    limit,
    offset,
    orderBy,
    orderDirection,
  }: SearchOpportunitiesInput): Promise<
    Result<SearchOpportunitiesResult, GenericError>
  > => {
    try {
      const validityFilter = and(
        eq(opportunityMaterializedView.language, language),
        isNotNull(opportunityMaterializedView.name),
        isNotNull(opportunityMaterializedView.profileDisplayName),
        isNotNull(opportunityMaterializedView.beneficiaryBenefitType),
      );

      const direction = orderDirection === "asc" ? asc : desc;

      const [rows, totalRows] = await Promise.all([
        db
          .selectDistinct({
            beneficiaryBenefitDiscountType:
              opportunityMaterializedView.beneficiaryBenefitDiscountType,
            beneficiaryBenefitType: sql<BenefitType>`${opportunityMaterializedView.beneficiaryBenefitType}`,
            beneficiaryBenefitValue:
              opportunityMaterializedView.beneficiaryBenefitValue,
            dateFrom: opportunityMaterializedView.dateFrom,
            dateTo: opportunityMaterializedView.dateTo,
            id: opportunityMaterializedView.id,
            language: opportunityMaterializedView.language,
            name: sql<string>`${opportunityMaterializedView.name}`,
            profileDisplayName: sql<string>`${opportunityMaterializedView.profileDisplayName}`,
          })
          .from(opportunityMaterializedView)
          .where(validityFilter)
          .orderBy(direction(orderByColumn[orderBy]))
          .limit(limit)
          .offset(offset),
        db
          .select({
            total: countDistinct(opportunityMaterializedView.id),
          })
          .from(opportunityMaterializedView)
          .where(validityFilter),
      ]);

      const items: OpportunitySearchItem[] = rows.map((row) => ({
        beneficiaryBenefitDiscountType: row.beneficiaryBenefitDiscountType,
        beneficiaryBenefitType: row.beneficiaryBenefitType,
        beneficiaryBenefitValue: row.beneficiaryBenefitValue,
        id: row.id,
        name: row.name,
        profileDisplayName: row.profileDisplayName,
        ...(row.dateFrom ? { dateFrom: row.dateFrom } : {}),
        ...(row.dateTo ? { dateTo: row.dateTo } : {}),
        ...(row.language ? { language: row.language } : {}),
      }));

      return ok({ items, total: totalRows[0]?.total ?? 0 });
    } catch (error) {
      return err(
        new GenericError(`Failed to search opportunities: ${String(error)}`),
      );
    }
  },
});

import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { and, count, eq, ilike, sql } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type {
  GetOpportunityByIdInput,
  ListOpportunitiesInput,
  OpportunityRepository,
  PaginatedOpportunities,
  UpdateOpportunityStatusInput,
} from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import {
  mapOpportunityDetailRow,
  mapOpportunitySummaryRow,
} from "./opportunity-row.mapper.js";
import { createOpportunityInTransaction } from "./opportunity.transaction.js";
import * as schema from "./schema/index.js";
import {
  localizedMetadata,
  opportunity,
  opportunityCategory,
} from "./schema/tables.js";

const escapeIlikePattern = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

export const createDrizzleOpportunityRepository = (
  db: TypedDbClient<typeof schema>,
): OpportunityRepository => ({
  create: async (input): Promise<Result<void, GenericError>> => {
    try {
      await db.transaction(async (tx) => {
        await createOpportunityInTransaction(
          tx,
          input.operatorId,
          input.opportunity,
        );
      });

      return ok(undefined);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to create operator opportunity: ${String(error)}`,
        ),
      );
    }
  },

  getById: async (input: GetOpportunityByIdInput) => {
    try {
      const row = await db.query.opportunity.findFirst({
        columns: {
          categoryId: true,
          createdAt: true,
          dateFrom: true,
          dateTo: true,
          id: true,
          status: true,
          updatedAt: true,
          url: true,
        },
        where: and(
          eq(opportunity.id, input.opportunityId),
          eq(opportunity.operatorId, input.operatorId),
        ),
        with: {
          beneficiaryBenefit: {
            columns: {
              description: true,
              discountType: true,
              type: true,
              value: true,
            },
          },
          caregiverBenefit: {
            columns: {
              description: true,
              discountType: true,
              type: true,
              value: true,
            },
          },
          category: { columns: { title: true } },
          localizedMetadata: {
            columns: { key: true, language: true, value: true },
          },
          opportunityPlaces: { columns: { placeId: true } },
        },
      });

      if (!row) {
        return ok(undefined);
      }

      return mapOpportunityDetailRow(row);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to get operator opportunity: ${String(error)}`,
        ),
      );
    }
  },

  list: async (
    input: ListOpportunitiesInput,
  ): Promise<Result<PaginatedOpportunities, GenericError>> => {
    try {
      const nameJoinCondition = and(
        eq(localizedMetadata.opportunityId, opportunity.id),
        sql`${localizedMetadata.key} = 'name'`,
        sql`${localizedMetadata.language} = 'it'`,
      );

      const conditions = [eq(opportunity.operatorId, input.operatorId)];

      if (input.status) {
        conditions.push(sql`${opportunity.status} = ${input.status}`);
      }

      if (input.search) {
        conditions.push(
          ilike(
            localizedMetadata.value,
            `%${escapeIlikePattern(input.search)}%`,
          ),
        );
      }

      const orderColumn =
        input.sortBy === "updatedAt"
          ? opportunity.updatedAt
          : opportunity.createdAt;

      const orderDirection =
        input.sortOrder === "asc" ? sql`ASC NULLS LAST` : sql`DESC NULLS LAST`;

      const [dataResult, countResult] = await Promise.all([
        db
          .select({
            categoryTitle: opportunityCategory.title,
            dateFrom: opportunity.dateFrom,
            dateTo: opportunity.dateTo,
            id: opportunity.id,
            name: localizedMetadata.value,
            status: opportunity.status,
          })
          .from(opportunity)
          .leftJoin(localizedMetadata, nameJoinCondition)
          .innerJoin(
            opportunityCategory,
            eq(opportunityCategory.id, opportunity.categoryId),
          )
          .where(and(...conditions))
          .orderBy(sql`${orderColumn} ${orderDirection}`)
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ total: count() })
          .from(opportunity)
          .leftJoin(localizedMetadata, nameJoinCondition)
          .innerJoin(
            opportunityCategory,
            eq(opportunityCategory.id, opportunity.categoryId),
          )
          .where(and(...conditions)),
      ]);

      const items = dataResult.map(mapOpportunitySummaryRow);
      const total = countResult[0]?.total ?? 0;

      return ok({ items, total });
    } catch (error) {
      return err(
        new GenericError(
          `Failed to list operator opportunities: ${String(error)}`,
        ),
      );
    }
  },

  updateStatus: async (
    input: UpdateOpportunityStatusInput,
  ): Promise<Result<void, GenericError>> => {
    try {
      await db
        .update(opportunity)
        .set({ status: input.status, updatedAt: new Date() })
        .where(
          and(
            eq(opportunity.id, input.opportunityId),
            eq(opportunity.operatorId, input.operatorId),
          ),
        );

      return ok(undefined);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to update opportunity status: ${String(error)}`,
        ),
      );
    }
  },
});

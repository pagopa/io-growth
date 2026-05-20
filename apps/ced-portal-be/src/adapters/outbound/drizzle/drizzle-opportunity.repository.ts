import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { and, count, eq, gte, ilike, inArray, lte, sql } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { OpportunityDetail } from "../../../domain/entities/opportunity.js";
import type {
  FindByIdAndOperatorIdInput,
  FindByIdInput,
  ListOpportunitiesInput,
  OpportunityRepository,
  PaginatedOpportunities,
  UpdateOpportunityStatusByIdAndOperatorIdInput,
  UpdateOpportunityStatusByIdInput,
} from "../../../domain/ports/outbound/persistence/opportunity.repository.js";

import {
  mapOpportunityDetailRow,
  mapOpportunitySummaryRow,
} from "./opportunity-row.mapper.js";
import { createOpportunityInTransaction } from "./opportunity.transaction.js";
import * as schema from "./schema/index.js";
import {
  localizedMetadata,
  operator,
  opportunity,
  opportunityCategory,
} from "./schema/tables.js";

type DbOrTxClient = TransactionClient | TypedDbClient<typeof schema>;

type TransactionClient = Parameters<
  Parameters<TypedDbClient<typeof schema>["transaction"]>[0]
>[0];

const escapeIlikePattern = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

const findByIdAndOperatorId = async (
  db: DbOrTxClient,
  input: FindByIdAndOperatorIdInput,
): Promise<Result<OpportunityDetail | undefined, GenericError>> => {
  try {
    const row = await db.query.opportunity.findFirst({
      columns: {
        categoryId: true,
        createdAt: true,
        dateFrom: true,
        dateTo: true,
        id: true,
        nationalTerritory: true,
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
      new GenericError(`Failed to get operator opportunity: ${String(error)}`),
    );
  }
};
const findById =
  (db: TypedDbClient<typeof schema>) =>
  async (
    input: FindByIdInput,
  ): Promise<Result<OpportunityDetail | undefined, GenericError>> => {
    try {
      const row = await db.query.opportunity.findFirst({
        columns: {
          categoryId: true,
          createdAt: true,
          dateFrom: true,
          dateTo: true,
          id: true,
          nationalTerritory: true,
          status: true,
          updatedAt: true,
          url: true,
        },
        where: eq(opportunity.id, input.opportunityId),
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
          operator: { columns: { name: true } },
          opportunityPlaces: { columns: { placeId: true } },
        },
      });
      if (!row) return ok(undefined);
      return mapOpportunityDetailRow(row);
    } catch (error) {
      return err(
        new GenericError(`Failed to get opportunity: ${String(error)}`),
      );
    }
  };

const updateStatusById =
  (db: TypedDbClient<typeof schema>) =>
  async (
    input: UpdateOpportunityStatusByIdInput,
  ): Promise<Result<void, ConflictError | GenericError>> => {
    try {
      const result = await db
        .update(opportunity)
        .set({
          ...(input.dateFrom ? { dateFrom: input.dateFrom } : {}),
          status: input.status,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(opportunity.id, input.opportunityId),
            inArray(opportunity.status, input.expectedStatuses),
          ),
        );
      if (result.count === 0)
        return err(
          new ConflictError("Opportunity status was modified concurrently"),
        );
      return ok(undefined);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to update opportunity status: ${String(error)}`,
        ),
      );
    }
  };

export const createDrizzleOpportunityRepository = (
  db: TypedDbClient<typeof schema>,
): OpportunityRepository => ({
  countByOperatorIds: async (operatorIds) => {
    if (operatorIds.length === 0) {
      return ok(new Map<string, number>());
    }
    try {
      const rows = await db
        .select({
          operatorId: opportunity.operatorId,
          total: count(),
        })
        .from(opportunity)
        .where(inArray(opportunity.operatorId, [...operatorIds]))
        .groupBy(opportunity.operatorId);

      const result = new Map<string, number>(
        rows.map((row) => [row.operatorId, row.total]),
      );
      return ok(result);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to count opportunities by operator ids: ${String(error)}`,
        ),
      );
    }
  },

  create: async (input): Promise<Result<OpportunityDetail, GenericError>> => {
    try {
      const created = await db.transaction(async (tx) => {
        await createOpportunityInTransaction(
          tx,
          input.operatorId,
          input.opportunity,
        );

        return await findByIdAndOperatorId(tx, {
          operatorId: input.operatorId,
          opportunityId: input.opportunity.id,
        });
      });

      if (created.isErr()) {
        return err(created.error);
      }

      if (!created.value) {
        return err(
          new GenericError(
            `Failed to read created operator opportunity ${input.opportunity.id}`,
          ),
        );
      }

      return ok(created.value);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to create operator opportunity: ${String(error)}`,
        ),
      );
    }
  },

  findById: findById(db),

  findByIdAndOperatorId: async (input: FindByIdAndOperatorIdInput) =>
    findByIdAndOperatorId(db, input),

  list: async (
    input: ListOpportunitiesInput,
  ): Promise<Result<PaginatedOpportunities, GenericError>> => {
    try {
      const nameJoinCondition = and(
        eq(localizedMetadata.opportunityId, opportunity.id),
        sql`${localizedMetadata.key} = 'name'`,
        sql`${localizedMetadata.language} = 'it'`,
      );

      const conditions = [];
      if (input.operatorId)
        conditions.push(eq(opportunity.operatorId, input.operatorId));
      if (input.categoryId)
        conditions.push(eq(opportunity.categoryId, input.categoryId));
      if (input.dateFrom)
        conditions.push(gte(opportunity.dateFrom, input.dateFrom));
      if (input.dateTo) conditions.push(lte(opportunity.dateTo, input.dateTo));
      if (input.status)
        conditions.push(sql`${opportunity.status} = ${input.status}`);
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
            operatorName: operator.name,
            status: opportunity.status,
          })
          .from(opportunity)
          .leftJoin(localizedMetadata, nameJoinCondition)
          .innerJoin(
            opportunityCategory,
            eq(opportunityCategory.id, opportunity.categoryId),
          )
          .innerJoin(operator, eq(opportunity.operatorId, operator.id))
          .where(and(...conditions))
          // id as tiebreaker ensures stable pagination when multiple records share the same createdAt/updatedAt
          .orderBy(
            sql`${orderColumn} ${orderDirection}, ${opportunity.id} ${orderDirection}`,
          )
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
          .innerJoin(operator, eq(opportunity.operatorId, operator.id))
          .where(and(...conditions)),
      ]);

      const items = dataResult.map(mapOpportunitySummaryRow);
      const total = countResult[0]?.total ?? 0;

      return ok({ items, total });
    } catch (error) {
      return err(
        new GenericError(`Failed to list opportunities: ${String(error)}`),
      );
    }
  },

  updateStatusById: updateStatusById(db),

  updateStatusByIdAndOperatorId: async (
    input: UpdateOpportunityStatusByIdAndOperatorIdInput,
  ): Promise<Result<void, ConflictError | GenericError>> => {
    try {
      const conditions = [
        eq(opportunity.id, input.opportunityId),
        eq(opportunity.operatorId, input.operatorId),
      ];

      if (input.expectedStatus) {
        conditions.push(eq(opportunity.status, input.expectedStatus));
      }

      let updateCount = 0;
      await db.transaction(async (tx) => {
        const result = await tx
          .update(opportunity)
          .set({ status: input.status, updatedAt: new Date() })
          .where(and(...conditions));
        updateCount = result.count;
      });

      if (updateCount === 0) {
        return err(
          new ConflictError("Opportunity status was modified concurrently"),
        );
      }

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

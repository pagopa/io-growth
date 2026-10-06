import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import {
  and,
  asc,
  count,
  eq,
  ilike,
  inArray,
  ne,
  notExists,
} from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { Place } from "../../../domain/entities/place.js";
import type {
  ListPlacesInput,
  PaginatedPlaces,
  PlaceRepository,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

import { OPPORTUNITY_STATUS } from "../../../domain/entities/opportunity.js";
import { mapPlaceRow, mapPlaceRows } from "./place-row.mapper.js";
import { createPlaceInTransaction } from "./place.transaction.js";
import * as schema from "./schema/index.js";
import {
  opportunity,
  opportunityPlace,
  place,
  profile,
  supportContact,
} from "./schema/tables.js";
import { escapeIlikePattern } from "./utils/escape-ilike-pattern.js";

export const createDrizzlePlaceRepository = (
  db: TypedDbClient<typeof schema>,
): PlaceRepository => ({
  create: async (input): Promise<Result<Place, GenericError>> => {
    try {
      let created!: Place;
      await db.transaction(async (tx) => {
        created = await createPlaceInTransaction(
          tx,
          input.operatorId,
          input.place,
        );
      });

      return ok(created);
    } catch (error) {
      return err(
        new GenericError(`Failed to create operator place: ${String(error)}`),
      );
    }
  },

  getById: async (input): Promise<Result<Place | undefined, GenericError>> => {
    try {
      const row = await db.query.place.findFirst({
        columns: { id: true, name: true, type: true },
        where: and(
          eq(place.id, input.placeId),
          eq(place.operatorId, input.operatorId),
        ),
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
          profile: { columns: { id: true } },
          supportContacts: {
            columns: { id: true, type: true, value: true },
            orderBy: [asc(supportContact.createdAt), asc(supportContact.id)],
          },
          website: { columns: { url: true } },
        },
      });

      if (!row || row.profile) {
        return ok(undefined);
      }

      return mapPlaceRow(row);
    } catch (error) {
      return err(
        new GenericError(`Failed to get operator place: ${String(error)}`),
      );
    }
  },

  getIdsByOperator: async (input): Promise<Result<string[], GenericError>> => {
    try {
      const rows = await db
        .select({ id: place.id })
        .from(place)
        .where(
          and(
            inArray(place.id, [...input.placeIds]),
            eq(place.operatorId, input.operatorId),
          ),
        );

      return ok(rows.map((row) => row.id));
    } catch (error) {
      return err(
        new GenericError(
          `Failed to get place ids by operator: ${String(error)}`,
        ),
      );
    }
  },

  listByOperatorId: async (
    input: ListPlacesInput,
  ): Promise<Result<PaginatedPlaces, GenericError>> => {
    try {
      const where = and(
        eq(place.operatorId, input.operatorId),
        notExists(
          db
            .select({ id: profile.id })
            .from(profile)
            .where(eq(profile.placeId, place.id)),
        ),
        input.search
          ? ilike(place.name, `%${escapeIlikePattern(input.search)}%`)
          : undefined,
        input.type ? eq(place.type, input.type) : undefined,
      );

      const [rows, countRows] = await Promise.all([
        db.query.place.findMany({
          columns: { id: true, name: true, type: true },
          limit: input.limit,
          offset: input.offset,
          orderBy: [asc(place.createdAt), asc(place.id)],
          where,
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
            supportContacts: {
              columns: { id: true, type: true, value: true },
              orderBy: [asc(supportContact.createdAt), asc(supportContact.id)],
            },
            website: { columns: { url: true } },
          },
        }),
        db.select({ total: count() }).from(place).where(where),
      ]);

      const mappedPlaces = mapPlaceRows(rows);
      if (mappedPlaces.isErr()) {
        return err(mappedPlaces.error);
      }

      const associationRows =
        rows.length === 0
          ? []
          : await db
              .select({
                associatedOpportunities: count(),
                placeId: opportunityPlace.placeId,
              })
              .from(opportunityPlace)
              .innerJoin(
                opportunity,
                eq(opportunity.id, opportunityPlace.opportunityId),
              )
              .where(
                and(
                  inArray(
                    opportunityPlace.placeId,
                    rows.map((row) => row.id),
                  ),
                  eq(opportunity.operatorId, input.operatorId),
                  ne(opportunity.status, OPPORTUNITY_STATUS.DELETED),
                ),
              )
              .groupBy(opportunityPlace.placeId);

      const associationCounts = new Map(
        associationRows.map((row) => [
          row.placeId,
          row.associatedOpportunities,
        ]),
      );

      return ok({
        items: mappedPlaces.value.map((item) => ({
          ...item,
          associatedOpportunities: associationCounts.get(item.id) ?? 0,
        })),
        total: countRows[0].total,
      });
    } catch (error) {
      return err(
        new GenericError(`Failed to list operator places: ${String(error)}`),
      );
    }
  },
});
